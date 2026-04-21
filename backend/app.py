import os
from google.genai import Client as GeminiClient
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from scrape import scrape_job_description, scrape_resume
from flask_cors import CORS
from colorama import Fore
import re
from jobspy import scrape_jobs
import os
from supabase import create_client, Client as SupabaseClient
from dotenv import load_dotenv

import base64
from pdf_generator import generate_styled_cv
import requests
from concurrent.futures import ThreadPoolExecutor
import json
# 1. ENVIRONMENT & CONFIGURATION
# Load environment variables (API keys, etc.) from .env file for security
if not os.environ.get("DOCKER_CONTAINER"):
        load_dotenv()

app = Flask(__name__)

# Initialize Clients
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
# Initialize Google Gemini Client using the modern generative AI SDK
api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")

# 2. SECURITY & CROSS-ORIGIN RESOURCE SHARING
# Restricting CORS to local development port to prevent unauthorized external access
# Define your allowed origins
allowed_origins = [
    "http://localhost:8080",
    "http://localhost:5173",
    "http://localhost:3000",
    "https://mentorsync-swart.vercel.app",
    "https://mentorsyncai.gentlemansolutions.com"
]

CORS(app, resources={
    r"/api/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

@app.errorhandler(400)
def handle_400_error(e):
    return jsonify({"status": "error", "message": str(e.description)}), 400

@app.errorhandler(404)
def handle_404_error(e):
    return jsonify({"status": "error", "message": "Resource not found"}), 404

@app.errorhandler(500)
def handle_500_error(e):
    return jsonify({"status": "error", "message": "Internal server error. Check logs."}), 500


client = GeminiClient(api_key=api_key)

# 4. JOBSPY CONFIGURATION
VALID_JOBSPY_COUNTRIES = [
    'argentina', 'australia', 'austria', 'bahrain', 'bangladesh', 'belgium', 'bulgaria', 'brazil', 
    'canada', 'chile', 'china', 'colombia', 'costa rica', 'croatia', 'cyprus', 'czech republic', 
    'czechia', 'denmark', 'ecuador', 'egypt', 'estonia', 'finland', 'france', 'germany', 'greece', 
    'hong kong', 'hungary', 'india', 'indonesia', 'ireland', 'israel', 'italy', 'japan', 'kuwait', 
    'latvia', 'lithuania', 'luxembourg', 'malaysia', 'malta', 'mexico', 'morocco', 'netherlands', 
    'new zealand', 'nigeria', 'norway', 'oman', 'pakistan', 'panama', 'peru', 'philippines', 
    'poland', 'portugal', 'qatar', 'romania', 'saudi arabia', 'singapore', 'slovakia', 'slovenia', 
    'south africa', 'south korea', 'spain', 'sweden', 'switzerland', 'taiwan', 'thailand', 
    'türkiye', 'turkey', 'ukraine', 'united arab emirates', 'uk', 'united kingdom', 'usa', 'us', 
    'united states', 'uruguay', 'venezuela', 'vietnam', 'usa/ca', 'worldwide'
]

def sanitize_location(location_str):
    """
    JobSpy crashes if the country in the location string is not supported.
    This helper checks the location and defaults to a safe country/worldwide if invalid.
    """
    if not location_str:
        return "Worldwide"
    
    loc_lower = location_str.lower()
    
    # Check if the string directly matches or ends with a valid country
    for country in VALID_JOBSPY_COUNTRIES:
        if loc_lower == country or loc_lower.endswith(f", {country}") or loc_lower.endswith(f" {country}"):
            return location_str
            
    # If it's a specific blocked country (like North Macedonia), return a stripped version or just Worldwide
    if "north macedonia" in loc_lower:
        print(f"{Fore.YELLOW}Sanitizing unsupported country: {location_str} -> Remote{Fore.RESET}")
        return "Remote"
        
    return location_str

def generate_with_fallback(contents, primary_model='gemini-2.5-flash'):

    """
    Attempts to generate content with a primary model, 
    falls back to a secondary if the primary is unavailable (503).
    """
    fallbacks = [primary_model, 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-2.0-flash-lite','gemini-1.5-flash']
    
    for model_name in fallbacks:
        try:
            print(f"Attempting generation with: {model_name}")
            response = client.models.generate_content(
                model=model_name,
                contents=contents
            )
            return response
        except Exception as e:
            if "503" in str(e) or "UNAVAILABLE" in str(e):
                print(f"Model {model_name} busy. Trying next fallback...")
                continue
            else:
                # If it's a different error (like 400), raise it immediately
                raise e
    raise Exception("All Gemini models are currently unavailable.")

# Set Hunter API key if available
HUNTER_API_KEY = os.environ.get("HUNTER_API_KEY")

@app.route('/api/generate-cv-data', methods=['POST'])
def generate_cv_data():
    """
    Step 2: Processes Job URL, Resume PDF, and user answers.
    Returns structured JSON (including the CV data) for the frontend to edit.
    """
    print(Fore.GREEN + "--- NEW GENERATE CV DATA REQUEST RECEIVED ---")
    
    try:
        # 4. DATA EXTRACTION
        job_url = request.form.get('job_url')
        resume_file = request.files.get('resume_pdf')
        user_answers = request.form.get('user_answers')
        
        # We need a domain for Hunter.io (e.g., 'stripe.com'). 
        # For simplicity, we can extract this via RegEx from the job_url
        import re
        company_domain_match = re.search(r'https?://(?:www\.)?([^/]+)', job_url)
        company_domain = company_domain_match.group(1) if company_domain_match else ""

        # 5. REQUEST VALIDATION
        if not job_url:
            return jsonify({"status": "error", "message": "No job_url provided"}), 400
        if not resume_file:
            return jsonify({"status": "error", "message": "No resume_pdf provided"}), 400
        
        # 6. EXTERNAL SCRAPING LOGIC (PARALLELIZED)
        job_text = request.form.get('job_text')
        resume_text = ""

        with ThreadPoolExecutor(max_workers=2) as executor:
            # Only scrape if job_text wasn't provided manually
            job_future = executor.submit(scrape_job_description, job_url) if not job_text else None
            resume_future = executor.submit(scrape_resume, resume_file)
            
            if job_future:
                job_desc_result = job_future.result()
                job_text = job_desc_result
            
            resume_text = resume_future.result()
        
        if not job_text or "Error" in job_text:
            return jsonify({"status": "error", "message": f"Job content missing or scraping failed: {job_text}"}), 500
        if "Error" in resume_text:
            return jsonify({"status": "error", "message": f"Resume parsing failed: {resume_text}"}), 500
        
        # HUNTER.IO LOGIC
        contact_emails = []
        if HUNTER_API_KEY and company_domain:
            try:
                # Try domain search
                h_res = requests.get(f"https://api.hunter.io/v2/domain-search?domain={company_domain}&api_key={HUNTER_API_KEY}")
                if h_res.status_code == 200:
                    h_data = h_res.json()
                    # Filter for specific departments if possible, or just grab top ones
                    emails = h_data.get('data', {}).get('emails', [])
                    for e in emails[:3]:
                        contact_emails.append(f"{e.get('value')} ({e.get('position', 'Unknown Role')})")
            except Exception as he:
                print(f"Hunter API Error: {he}")
        
        hunter_context = "\n".join(contact_emails) if contact_emails else "Unknown Hiring Manager"

        answers_context = ""
        if user_answers:
            answers_context = f"\n\nADDITIONAL CONTEXT FROM CANDIDATE:\nThe candidate was asked about missing skills, and provided these answers:\n{user_answers}\nIncorporate these confirmed skills into the tailored CV as if they were in the original resume. If they answered 'No', DO NOT add them."

        # 7. AI ENGINE / PROMPT ENGINEERING
        response = generate_with_fallback(f"""
            ROLE: Expert Career Coach & Resume Writer.

            CONTEXT:
            Reviewing a candidate's Resume against a Job Description (JD). 
            Goal: Tailor the CV to pass ATS systems (without lying) and provide actionable feedback.
            IMPORTANT: Preserve ALL content from the candidate's original resume. Do NOT drop any sections. If the candidate has projects, certifications, languages, volunteer work, or awards in their resume, INCLUDE THEM in the output.

            INPUTS:
            - Job Description: {job_text}
            - Candidate Resume: {resume_text}{answers_context}
            - Contact Info Found: {hunter_context}

            CRITICAL INSTRUCTIONS:
            1. Provide a `structured_cv` following EXACTLY the JSON pattern below. Do NOT use Markdown for the CV, just the raw text fields.
            2. DO NOT invent experience. DO NOT remove experience sections. Re-phrase bullet points with stronger action verbs and keyword alignment.
            3. Include the `projects` array if any projects exist in the original resume.
            4. Include the `certifications` array if any certifications exist in the original resume.
            5. Include the `languages` array if any languages exist in the original resume.
            6. Provide a `cold_email_body`: A short, compelling email to the Hiring Manager or CEO (use Contact Info Found if available). Don't sound robotic, avoid clichés, sound creative and out of the box.
            7. Provide `match_score_percent` (0-100).
            8. Provide `improvement_feedback`: Honest feedback on what they lack based on the JD.
            9. Provide `project_recommendations`: 1-2 specific projects they could build to show remaining missing skills.
            10. Provide `research_areas`: Specific topics or libraries mentioned in the JD they should study.

            JSON STRUCTURE FOR RESPONSE:
            {{
                "structured_cv": {{
                    "basics": {{
                        "name": "Jane Doe",
                        "title": "Senior Software Engineer",
                        "contact_info": "email@example.com | (555) 123-4567 | github.com/jane | linkedin.com/in/jane"
                    }},
                    "summary": "Experienced engineer...",
                    "skills": ["Python", "Docker", "AWS"],
                    "experience": [
                        {{
                            "company": "Tech Corp",
                            "location": "Remote",
                            "title": "Backend Engineer",
                            "dates": "Jan 2020 - Present",
                            "description": ["Led migration of monolith to microservices", "Reduced latency by 40%"]
                        }}
                    ],
                    "projects": [
                        {{
                            "name": "MyApp",
                            "description": "A full-stack web app using React and FastAPI",
                            "stack": ["React", "FastAPI", "PostgreSQL"],
                            "url": "https://github.com/jane/myapp"
                        }}
                    ],
                    "education": [
                        {{
                            "institution": "University of XYZ",
                            "degree": "B.S. Computer Science",
                            "dates": "2015-2019",
                            "details": "Graduated Cum Laude"
                        }}
                    ],
                    "certifications": [
                        {{
                            "name": "AWS Certified Developer",
                            "issuer": "Amazon Web Services",
                            "date": "2022"
                        }}
                    ],
                    "languages": [
                        {{ "language": "English", "level": "Native" }},
                        {{ "language": "German", "level": "B2" }}
                    ]
                }},
                "cold_email_body": "Subject: ...\\n\\nHi...",
                "cold_email_to": "email@example.com",
                "match_score_percent": 85,
                "improvement_feedback": "Your resume lacks emphasis on cloud deployments which is key here.",
                "project_recommendations": ["Build a small full-stack app and deploy it on AWS using Docker."],
                "research_areas": ["AWS ECS", "Docker basics", "CI/CD pipelines"]
            }}

            OUTPUT RESTRICTION: Return ONLY valid JSON, do not include markdown codeblocks around the JSON.
            """
        )

        # 8. DEBUG LOGGING
        print(f"{Fore.CYAN}--- RAW GEMINI RESPONSE (CV Data) ---")
        print(response.text)
        print(f"{Fore.CYAN}-------------------------------------")

        import json
        try:
            raw_text = response.text.replace("```json", "").replace("```", "").strip()
            parsed_data = json.loads(raw_text)
        except json.JSONDecodeError as je:
            print(f"{Fore.RED}JSON PARSING ERROR: {str(je)}")
            print(f"{Fore.RED}OFFENDING TEXT: {response.text}")
            return jsonify({"status": "error", "message": "AI returned invalid JSON. Check server logs."}), 500

        return jsonify({
            "status": "success",
            "data": parsed_data
        })

    except Exception as e:
        print(f"FATAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"status": "error", "message": "Internal processing error. Check server logs."}), 500

@app.route('/api/render-pdf', methods=['POST'])

def render_pdf():
    """
    Step 3: Takes (potentially edited) structured CV JSON and returns a PDF as base64.
    """
    try:
        cv_data = request.json
        if not cv_data:
            return jsonify({"status": "error", "message": "No CV data provided"}), 400
            
        print(f"{Fore.GREEN}Rendering PDF for: {cv_data.get('basics', {}).get('name', 'Unknown')}")
        pdf_bytes = generate_styled_cv(cv_data)
        pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')
        
        return jsonify({
            "status": "success",
            "pdf_base64": pdf_base64
        })
    except Exception as e:
        print(f"RENDER ERROR: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/analyze-job', methods=['POST'])
def analyze_specific_job():
    data = request.json
    job_url = data.get('job_url')
    
    # 1. Check if we already have this job's FULL description in Supabase
    existing = supabase.table("JobDetails").select("full_text").eq("url", job_url).maybe_single().execute()
    
    if existing.data:
        return jsonify({"full_text": existing.data['full_text'], "source": "cache"})

    # 2. If not in cache, do the heavy scrape (Jina)
    # This only happens ONCE per job across all your users
    full_text = scrape_job_description(job_url) 
    
    # 3. Save to Supabase so the next user gets it instantly
    supabase.table("JobDetails").insert({"url": job_url, "full_text": full_text}).execute()
    
    return jsonify({"full_text": full_text, "source": "fresh_scrape"})

    
def extract_keywords_from_resume(text):
    """
    Very basic keyword/title extraction based on common skills.
    In a real app, you might use spaCy or a stronger NLP matcher.
    """
    # Just an example list of common skills to look for
    common_skills = [
        "python", "java", "javascript", "react", "node.js", "flask", "django", 
        "sql", "aws", "docker", "kubernetes", "typescript", "html", "css", 
        "machine learning", "data science", "project manager", "software engineer",
        "frontend", "backend", "full stack"
    ]
    
    text_lower = text.lower()
    from typing import List
    found_skills: List[str] = []
    for skill in common_skills:
        if skill in text_lower:
            found_skills.append(skill)
            
    # Default search term if we couldn't find anything
    top_skills = [found_skills[i] for i in range(min(3, len(found_skills)))]
    search_term = " ".join(top_skills) if top_skills else "software engineer"
    print(f"Extracted search term: {search_term}")
    return search_term

def fetch_adzuna_jobs(search_term, location="Remote"):
    # Get these from Adzuna Developer Dashboard
    app_id = os.environ.get("ADZUNA_APP_ID")
    app_key = os.environ.get("ADZUNA_APP_KEY")
    
    # Adzuna uses country codes (us, gb, etc.)
    url = f"https://api.adzuna.com/v1/api/jobs/us/search/1"
    
    params = {
        "app_id": app_id,
        "app_key": app_key,
        "results_per_page": 50,
        "what": f"{search_term} remote",  # Add 'remote' to the keywords
        "where": "",                     # Leave location empty for global US remote
        "content-type": "application/json"
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            jobs = []
            for j in data.get('results', []):
                jobs.append({
                    "title": j.get("title"),
                    "company": j.get("company", {}).get("display_name"),
                    "location": j.get("location", {}).get("display_name"),
                    "job_url": j.get("redirect_url"),
                    "site": "adzuna",
                    "description": j.get("description") # Often includes a snippet!
                })
            return jobs
        return []
    except Exception as e:
        print(f"Adzuna Error: {e}")
        return []

@app.route('/api/jobs', methods=['POST'])
def get_jobs():
    try:
        # Use .get() to avoid KeyErrors
        data = request.form
        resume_file = request.files.get('resume_pdf')
        search_term = data.get('search_term')
        
        # 1. Determine Search Term
        if resume_file:
            resume_text = scrape_resume(resume_file)
            if resume_text and "Error" not in resume_text[:10]:
                search_term = extract_keywords_from_resume(resume_text)
        
        # Default fallback
        if not search_term or search_term.lower() == "undefined":
            search_term = "software engineer"

        # 2. Skip Cache Lookup (Ensures 'freshest always')
        # We go straight to the source
        location = data.get('location') or "Remote"
        print(f"DEBUG: Fetching fresh jobs for: {search_term} in {location}")
        
        cleaned_jobs = fetch_adzuna_jobs(search_term, location)

        # 3. Handle No Results gracefully (Prevents the 404 in Frontend)
        if not cleaned_jobs:
            print(f"DEBUG: No jobs found for {search_term}")
            return jsonify({
                "status": "success",
                "jobs": [],
                "message": "No fresh jobs found at this moment.",
                "search_term": search_term
            })

        # 4. Background Cache Update (Leverage)
        if supabase:
            try:
                db_jobs = [{
                    "title": j.get("title"),
                    "company": j.get("company"),
                    "location": j.get("location"),
                    "job_url": j.get("job_url"),
                    "site": j.get("site"),
                    "search_term": search_term,
                    "snippet": j.get("description")
                } for j in cleaned_jobs[:50]]
                
                # Upsert updates the existing ones and adds new ones
                supabase.table("ScrapedJobs").upsert(db_jobs, on_conflict="job_url").execute()
            except Exception as se:
                print(f"Background Cache Update Error: {se}")
        
        return jsonify({
            "status": "success",
            "jobs": cleaned_jobs,
            "search_term": search_term,
            "source": "adzuna_api"
        })

    except Exception as e:
        print(f"CRITICAL ERROR in get_jobs: {str(e)}")
        # Return 200 with an error status so the Frontend doesn't crash on a 404/500
        return jsonify({"status": "error", "message": "Server encountered an issue fetching jobs"}), 200
        
@app.route('/api/analyze-gap', methods=['POST'])
def analyze_gap():
    print(f"{Fore.YELLOW}STEP 1: Request received{Fore.RESET}")
    """
    Step 1 of Interactive Flow: 
    Analyzes job description and resume, then returns 3-5 Yes/No questions about missing skills.
    """
    try:
        job_url = request.form.get('job_url')
        resume_file = request.files.get('resume_pdf')

        if not job_url:
            return jsonify({"status": "error", "message": "No job_url provided"}), 400
        if not resume_file:
            return jsonify({"status": "error", "message": "No resume_pdf provided"}), 400
        
        print(f"{Fore.YELLOW}STEP 1: Prompting threads{Fore.RESET}")
        # Parallel Scraping for Gap Analysis
        job_text = request.form.get('job_text')
        
        with ThreadPoolExecutor(max_workers=2) as executor:
            job_future = executor.submit(scrape_job_description, job_url) if not job_text else None
            resume_future = executor.submit(scrape_resume, resume_file)
            
            if job_future:
                job_text = job_future.result()
            
            resume_text = resume_future.result()

        if "Error" in job_text:
            print(f"{Fore.RED}Scraping blocked for URL: {job_url}{Fore.RESET}")
            return jsonify({
                "status": "blocked", 
                "message": "Indeed/Board blocked our automated scan. Please paste the job text below for an instant analysis."
            }), 200
            
        response = generate_with_fallback(f"""
            ROLE: Expert Technical Recruiter.

            CONTEXT:
            Reviewing a candidate's Resume against a Job Description (JD). 
            Goal: Identify the top 3-5 technical skills or experiences strictly required by the JD that are MISSING or NOT EXPLICITLY STATED in the Resume.

            INPUTS:
            - Job Description: {job_text}
            - Candidate Resume: {resume_text}

            CRITICAL INSTRUCTIONS:
            We are going to ask the user if they actually have these missing skills (maybe they forgot to write them down).
            1. Extract exactly 3 to 5 critical missing skills.
            2. Formulate them as questions (e.g., "Do you have any experience with Docker, as it's required for this role?").

            JSON STRUCTURE:
            {{
                "questions": [
                    {{
                        "id": "skill_docker",
                        "question": "Do you have experience with Docker?",
                        "skill": "Docker"
                    }}
                ]
            }}

            OUTPUT RESTRICTION: Return ONLY valid JSON, do not include markdown codeblocks around the JSON.
            """
        )
        # 8. DEBUG LOGGING
        print(f"{Fore.CYAN}--- RAW GEMINI RESPONSE (Gap Analysis) ---")
        print(response.text)
        print(f"{Fore.CYAN}------------------------------------------")

        import json
        try:
            raw_text = response.text.replace("```json", "").replace("```", "").strip()
            parsed_q = json.loads(raw_text)
        except json.JSONDecodeError as je:
            print(f"{Fore.RED}JSON PARSING ERROR: {str(je)}")
            print(f"{Fore.RED}OFFENDING TEXT: {response.text}")
            return jsonify({"status": "error", "message": "AI returned invalid JSON. Check server logs."}), 500

        return jsonify({
            "status": "success",
            "data": parsed_q
        })

    except Exception as e:
        print(f"Error in analyze_gap: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

supabase: SupabaseClient = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("WARNING: Supabase credentials not found. DB features will not work.")

@app.route('/api/save-job', methods=['POST'])
def save_job():
    """
    Saves a job to the AppliedJobs table.
    Expects JSON body: { user_id, job_title, company, url, status, cv_markdown }
    """
    if not supabase:
        return jsonify({"status": "error", "message": "Database not configured."}), 500
        
    try:
        data = request.json
        user_id = data.get('user_id')
        job_title = data.get('job_title')
        company = data.get('company')
        job_url = data.get('url')
        status = data.get('status', 'Applied')
        
        if not user_id or not job_title or not company:
            return jsonify({"status": "error", "message": "Missing required fields"}), 400

        # Insert into AppliedJobs - assuming table exists
        result = supabase.table("AppliedJobs").insert({
            "user_id": user_id,
            "job_title": job_title,
            "company": company,
            "url": job_url,
            "status": status
        }).execute()

        # You might also want to save the TailoredCV in a separate table, but we'll stick to job tracking first.
        return jsonify({"status": "success", "data": result.data})
        
    except Exception as e:
        print(f"Error saving job: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/applied-jobs', methods=['GET'])
def get_applied_jobs():
    """
    Retrieves applied jobs for a specific user.
    Query param: ?user_id=abc
    """
    if not supabase:
        return jsonify({"status": "error", "message": "Database not configured."}), 500
        
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"status": "error", "message": "No user_id provided"}), 400
            
        result = supabase.table("AppliedJobs").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        
        return jsonify({"status": "success", "data": result.data})
        
    except Exception as e:
        print(f"Error fetching applied jobs: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    # Use Render's PORT if it exists, otherwise use 5555 for local dev
    port = int(os.environ.get("PORT", 5555))
    # Must use 0.0.0.0 to be visible to Render's network
    app.run(host='0.0.0.0', port=port)