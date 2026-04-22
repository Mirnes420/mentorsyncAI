import sys
import os
import requests
from dotenv import load_dotenv
from flask import Flask
from app import app
import json

# Fix Windows encoding issues for special characters
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

load_dotenv()

def test_cache_and_scrape():
    # We'll use the app's test_client to simulate requests
    with app.test_client() as client:
        search_term = "python developer"
        
        print("\n--- TEST 1: Cache Miss (First Fetch) ---")
        response = client.post('/api/jobs', json={"search_term": search_term, "location": "Remote"})
        data = response.get_json()
        print(f"Source: {data.get('source')}")
        print(f"Jobs found: {len(data.get('jobs', []))}")
        
        print("\n--- TEST 2: Cache Hit (Second Fetch) ---")
        response = client.post('/api/jobs', json={"search_term": search_term, "location": "Remote"})
        data = response.get_json()
        print(f"Source: {data.get('source')}")
        print(f"Jobs found: {len(data.get('jobs', []))}")
        
        if data.get('jobs') and len(data['jobs']) > 0:
            first_job_url = data['jobs'][0]['job_url']
            print(f"\n--- TEST 3: Scraping with Selenium (Fallback) ---")
            print(f"URL: {first_job_url}")
            from scrape import scrape_job_description
            # We'll force jina to fail or just let it run
            desc = scrape_job_description(first_job_url)
            print(f"Scraped length: {len(desc)}")
            print(f"Snippet: {desc[:200]}...")

if __name__ == "__main__":
    test_cache_and_scrape()
