import os
from dotenv import load_dotenv
import requests

load_dotenv()

def fetch_adzuna_jobs(search_term, location="Remote"):
    app_id = os.environ.get("ADZUNA_APP_ID")
    app_key = os.environ.get("ADZUNA_APP_KEY")
    url = f"https://api.adzuna.com/v1/api/jobs/us/search/1"
    
    def run_search(query):
        params = {
            "app_id": app_id,
            "app_key": app_key,
            "results_per_page": 50,
            "what": query,
            "where": "",
            "content-type": "application/json"
        }
        try:
            resp = requests.get(url, params=params, timeout=10)
            if resp.status_code == 200:
                results = resp.json().get('results', [])
                print(f"Adzuna: Found {len(results)} jobs for '{query}'")
                return results
            else:
                print(f"Adzuna Error: Status {resp.status_code}, Body {resp.text}")
        except Exception as e:
            print(f"Adzuna Search Error ({query}): {e}")
        return []

    # 1. Try specific remote search
    raw_results = run_search(f"{search_term} remote")

    # 2. Fallback: Broader search if 0 found
    if not raw_results:
        print(f"Adzuna: 0 results for '{search_term} remote'. Trying broader fallback...")
        raw_results = run_search(search_term)

    return raw_results

print(f"Result for 'python django backend': {len(fetch_adzuna_jobs('python django backend'))} jobs found")
