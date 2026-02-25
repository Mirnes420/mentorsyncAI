import os
from google.genai import Client
from flask import Flask, request, jsonify
import dotenv
from scrape import scrape_job_description, scrape_resume
from flask_cors import CORS

# 1. ENVIRONMENT & CONFIGURATION
# Load environment variables (API keys, etc.) from .env file for security
dotenv.load_dotenv()

app = Flask(__name__)

# 2. SECURITY & CROSS-ORIGIN RESOURCE SHARING
# Restricting CORS to local development port to prevent unauthorized external access
CORS(app, resources={r"/*": {"origins": "http://localhost:8080"}})

# 3. AI CLIENT INITIALIZATION
# Initialize Google Gemini Client using the modern generative AI SDK
client = Client(api_key=os.environ.get("GOOGLE_API_KEY"))

@app.route('/generate-bait', methods=['POST'])
def generate_bait():
    """
    Main API Entry Point:
    Processes a Job URL and a Resume PDF to generate AI-driven career feedback.
    Returns: JSON containing match score, gap analysis, and a custom mentorship email.
    """
    print("--- NEW REQUEST RECEIVED ---")
    
    try:
        # 4. DATA EXTRACTION
        # Retrieving multipart/form-data: job_url (string) and resume_pdf (file object)
        job_url = request.form.get('job_url')
        resume_file = request.files.get('resume_pdf')

        # 5. REQUEST VALIDATION
        # Fail-fast approach: immediately return 400 if required inputs are missing
        if not job_url:
            return jsonify({"status": "error", "message": "No job_url provided"}), 400
        if not resume_file:
            return jsonify({"status": "error", "message": "No resume_pdf provided"}), 400
        
        # 6. EXTERNAL SCRAPING LOGIC
        # Modularized scraping functions to keep the controller clean
        # scrape_resume handles PDF binary-to-text conversion
        job_desc = scrape_job_description(job_url)
        resume_text = scrape_resume(resume_file)

        # 7. AI ENGINE / PROMPT ENGINEERING
        # Using 'gemini-2.5-flash-lite' for cost-effective, high-speed inference.
        # The prompt uses 'Few-Shot' and 'Persona' techniques to ensure empathetic output.
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite', 
            contents = f"""
            ROLE: Empathetic Career Mentor & Senior Technical Recruiter.

            CONTEXT:
            Reviewing a candidate's Resume against a Job Description (JD). 
            Goal: Transparency and a "Growth Roadmap" instead of traditional ghosting.

            INPUTS:
            - Job Description: {job_desc}
            - Candidate Resume: {resume_text}

            CRITICAL INSTRUCTIONS FOR FEEDBACK:
            1. AVOID CLICHÉS: Do not use "After careful consideration" or "many qualified candidates." 
            2. BE SPECIFIC: If they lack Python experience, don't say "learn Python." Say "Your profile lacks experience with asynchronous frameworks like FastAPI, which is core to this role."
            3. THE "SILVER LINING": Identify one specific strength in their resume that actually impressed you, even if they aren't a fit for this specific role.
            4. ACTIONABLE STEPS: Suggest a specific project type or certification that would bridge the gap.
            5. MENTORSHIP EMAIL: Write a warm, human-centric email. Start with a genuine compliment about their background. Transition into the specific technical gaps found. End with encouragement and a specific 'next step' for their career growth.

            JSON STRUCTURE:
            {{
            "match_score_percent": 0,
            "is_good_fit": false,
            "top_3_gap_analysis": [
                {{
                    "missing_skill": "string",
                    "why_it_matters_for_this_role": "string",
                    "how_to_fix_it": "specific project or resource idea"
                }}
            ],
            "mentorship_email": "A warm, human-centric email. Start with a genuine compliment about their background. Transition into the specific technical gaps found. End with encouragement and a specific 'next step' for their career growth."
            }}

            OUTPUT RESTRICTION: Return ONLY valid JSON.
            """
        )

        # 8. RESPONSE HANDLING
        # Note: In production, consider adding a JSON sanitizer here to strip potential markdown code blocks (```json)
        print("Gemini Response successfully generated.")
        
        return jsonify({
            "status": "success",
            "bait_markdown": response.text  # The raw JSON string from Gemini
        })

    except Exception as e:
        # 9. ERROR LOGGING
        # Catching system-level failures (Scraping errors, AI timeouts, etc.)
        print(f"FATAL ERROR: {str(e)}")
        return jsonify({"status": "error", "message": "Internal processing error. Check server logs."}), 500

if __name__ == '__main__':
    # Running on custom port 5555 to avoid conflicts with common 5000/8000 defaults
    app.run(port=5555, debug=True)