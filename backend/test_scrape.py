from jobspy import scrape_jobs
import pandas as pd

try:
    print("Testing jobspy scraper...")
    jobs_df = scrape_jobs(
        site_name=["indeed", "linkedin", "glassdoor"],
        search_term="software engineer",
        location="Remote",
        results_wanted=10,
        country_indeed='USA'
    )
    print(f"Scrape successful. Found {len(jobs_df)} jobs.")
    print(jobs_df.head())
except Exception as e:
    print(f"Scrape failed: {e}")