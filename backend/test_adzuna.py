import os
from dotenv import load_dotenv
import requests

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



print(fetch_adzuna_jobs("software engineer", "Remote"))