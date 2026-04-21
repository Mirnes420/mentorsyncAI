import os
import requests
from dotenv import load_dotenv
from flask import jsonify

load_dotenv()

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
            print(f"Total jobs found: {data.get('count')}")
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


def get_jobs():
    try:
        # Use .get() to avoid KeyErrors
        search_term = "software engineer"
        

        # Default fallback
        if not search_term or search_term.lower() == "undefined":
            search_term = "software engineer"

        # 2. Skip Cache Lookup (Ensures 'freshest always')
        # We go straight to the source
        location = "Remote"
        print(f"DEBUG: Fetching fresh jobs for: {search_term} in {location}")
        
        cleaned_jobs = fetch_adzuna_jobs(search_term)

        # 3. Handle No Results gracefully (Prevents the 404 in Frontend)
        if not cleaned_jobs:
            print(f"DEBUG: No jobs found for {search_term}")
            return jsonify({
                "status": "success",
                "jobs": [],
                "message": "No fresh jobs found at this moment.",
                "search_term": search_term
            })
        
        print("clean jobs from adzuna", cleaned_jobs)
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


get_jobs()
