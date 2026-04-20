from seleniumbase import Driver
import time
from flask import jsonify
from pypdf import PdfReader
import re
import os
import requests
from colorama import Fore, Style
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
    print(f"{Fore.CYAN}Scraping via Jina: {url}{Fore.RESET}")
    
    try:
        # Jina Reader API: Just prefix the URL with https://r.jina.ai/
        jina_url = f"https://r.jina.ai/{url}"
        
        # We set a timeout to ensure the app doesn't hang forever
        response = requests.get(jina_url, timeout=20)
        
        if response.status_code != 200:
            return f"Error: Jina was unable to scrape the site (Status {response.status_code})"

        job_text = response.text

        # 1. CLEANING LOGIC (Still useful for removing footer junk)
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

        # 2. Final Polish
        # Jina returns Markdown, so we just strip whitespace
        final_text = job_text.strip()
        
        if len(final_text) < 100:
            return "Error: Scraped content is too short. Cloudflare might still be blocking the proxy."

        return final_text

    except Exception as e:
        return f"Error: {str(e)}"