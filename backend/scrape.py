from seleniumbase import Driver
import time
from flask import jsonify
from pypdf import PdfReader
import re
import os

# 1. SCRAPING FUNCTIONALITY FOR RESUME DATA EXTRACTION
def scrape_resume(resume_file):
    if not resume_file:
        raise AttributeError("No file provided")
    
    try:
        # Reset file pointer just in case it was read elsewhere
        resume_file.seek(0) 
        
        reader = PdfReader(resume_file)
        text = ""
        for page in reader.pages:
            content = page.extract_text()
            if content:
                text += content + "\n"
        
        if not text.strip():
            return "Error: PDF extracted as empty string"
            
        return text.strip()
    except Exception as e:
        return f"Error parsing PDF: {str(e)}"

# 2. SCRAPING FUNCTIONALITY FOR JOB DESCRIPTION EXTRACTION FROM A WE
def scrape_job_description(url):
    driver = Driver(uc=True, headless=True)
    
    try:
        driver.get(url)
        # Wait for the anti-bot check and content load
        # Using a shorter wait for speed, though some sites might need more.
        time.sleep(4) 
        
        # 1. Try to get ONLY the central container first (RemoteRocketship uses div.description)
        selector = "div.description"
        job_text = ""

        if driver.is_element_visible(selector):
            job_text = driver.get_text(selector)
        else:
            # Fallbacks for other boards
            fallbacks = [".job-description", "#jobDescriptionText", "article", "main"]
            for f in fallbacks:
                if driver.is_element_visible(f):
                    job_text = driver.get_text(f)
                    break
            
            if not job_text:
                job_text = driver.get_text("body")

        # 2. CLEANING LOGIC (The Fine-Tuning)
        # We chop off everything after the common "Footer" phrases start
        stop_words = [
            "Discover 100,000+", 
            "Join now to find your dream", 
            "Find Your Dream Remote Job",
            "Frequently asked questions",
            "Search Jobs by country"
        ]
        
        for word in stop_words:
            if word in job_text:
                job_text = job_text.split(word)[0]

        # 3. Final Polish: Remove extra whitespace and leading/trailing junk
        job_text = job_text.strip()
        
        # Remove common header junk if it was captured
        # (e.g., if the scrape started way too high up)
        job_text = re.sub(r'^(🌐|Worldwide|Post a Job|Affiliates|Search).*?\n', '', job_text, flags=re.IGNORECASE | re.MULTILINE)

        return job_text.strip()

    except Exception as e:
        return f"Error: {str(e)}"
    finally:
        driver.quit()
