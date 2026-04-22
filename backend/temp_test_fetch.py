import os
import requests
from dotenv import load_dotenv
from scrape import scrape_job_description

load_dotenv()

def test_fetch_and_scrape():
    app_id = os.environ.get("ADZUNA_APP_ID")
    app_key = os.environ.get("ADZUNA_APP_KEY")
    
    if not app_id or not app_key:
        print("Missing Adzuna credentials")
        return

    url = "https://api.adzuna.com/v1/api/jobs/us/search/1"
    params = {
        "app_id": app_id,
        "app_key": app_key,
        "results_per_page": 2,
        "what": "software engineer",
        "where": "remote",
        "content-type": "application/json"
    }

    print("Fetching jobs from Adzuna...")
    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', [])
            for i, j in enumerate(results):
                job_url = j.get("redirect_url")
                print(f"\n[{i}] Job URL: {job_url}")
                print(f"Scraping description for job {i}...")
                desc = scrape_job_description(job_url)
                print(f"Scraped length: {len(desc)}")
                if desc.startswith("Error"):
                    print(f"Error: {desc}")
                else:
                    print(f"Snippet: {desc[:200]}...")
        else:
            print(f"Adzuna API error: {response.status_code}")
    except Exception as e:
        print(f"Error during test: {e}")

if __name__ == "__main__":
    test_fetch_and_scrape()
