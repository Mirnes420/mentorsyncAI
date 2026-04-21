import os
from dotenv import load_dotenv
import requests
import re

load_dotenv()

def fetch_adzuna_jobs(search_term, location="Remote"):
    app_id = os.environ.get("ADZUNA_APP_ID")
    app_key = os.environ.get("ADZUNA_APP_KEY")
    
    url = f"https://api.adzuna.com/v1/api/jobs/us/search/1"
    
    params = {
        "app_id": app_id,
        "app_key": app_key,
        "results_per_page": 10, # Reduced for cleaner terminal output
        "what": search_term,
        "where": location,
        "content-type": "application/json"
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            raw_results = data.get('results', [])
            
            jobs = []
            for j in raw_results:
                # Helper to strip HTML tags from Adzuna descriptions
                clean_desc = re.sub('<[^<]+?>', '', j.get("description", ""))
                
                jobs.append({
                    "title": j.get("title").strip(),
                    "company": j.get("company", {}).get("display_name"),
                    "location": j.get("location", {}).get("display_name"),
                    "job_url": j.get("redirect_url"),
                    "description": clean_desc[:150] + "..." # Snippet for readability
                })
            return jobs
        return []
    except Exception as e:
        print(f"Adzuna Error: {e}")
        return []

# --- NICE PRINTING LOGIC ---
results = fetch_adzuna_jobs("software engineer", "ba")

if not results:
    print("No jobs found or API error.")
else:
    print(f"\n{'='*80}")
    print(f" FOUND {len(results)} JOBS ")
    print(f"{'='*80}\n")

    for idx, job in enumerate(results, 1):
        print(f"[{idx}] {job['title'].upper()}")
        print(f"    🏢 Company:  {job['company']}")
        print(f"    📍 Location: {job['location']}")
        print(f"    🔗 URL:      {job['job_url']}")
        print(f"    📝 Desc:     {job['description']}")
        print(f"{'-'*80}")