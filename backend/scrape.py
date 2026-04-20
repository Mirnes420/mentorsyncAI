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

# 2. SCRAPING FUNCTIONALITY FOR JOB DESCRIPTION EXTRACTION FROM A WEBSITE
def scrape_job_description(url):
    print(f"{Fore.CYAN}Scraping via Jina: {url}{Fore.RESET}")
    
    jina_key = os.environ.get("JINA_API_KEY")
    headers = {
        "Accept": "text/plain", # Prefer plain text/markdown
    }
    if jina_key:
        headers["Authorization"] = f"Bearer {jina_key}"

    try:
        # Jina Reader API: Just prefix the URL with https://r.jina.ai/
        jina_url = f"https://r.jina.ai/{url}"
        
        # We set a stricter 10s timeout to prevent the app from hanging
        response = requests.get(jina_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
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

            # Final Polish
            final_text = job_text.strip()
            if len(final_text) > 150:
                print(f"{Fore.GREEN}Successfully scraped via Jina{Fore.RESET}")
                return final_text
    
    except Exception as e:
        print(f"{Fore.YELLOW}Jina failed: {str(e)}. Trying direct fetch...{Fore.RESET}")

    # --- FALLBACK: Direct Fetch with Browser Headers ---
    try:
        print(f"{Fore.YELLOW}Fallback: Direct fetch for {url}{Fore.RESET}")
        fallback_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }
        res = requests.get(url, headers=fallback_headers, timeout=8)
        
        if res.status_code == 200:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(res.text, "html.parser")
            # Remove noise
            for tag in soup(["script", "style", "nav", "footer", "header"]):
                tag.decompose()
            
            # Try to find common job containers
            content = ""
            for selector in ["div.description", ".job-description", "#jobDescriptionText", "article", "main"]:
                found = soup.select_one(selector)
                if found:
                    content = found.get_text(separator="\n", strip=True)
                    break
            
            if not content:
                content = soup.get_text(separator="\n", strip=True)
                
            if len(content) > 150:
                print(f"{Fore.GREEN}Successfully scraped via Direct Fetch{Fore.RESET}")
                return content
                
        return f"Error: Scraping failed with status {res.status_code}"
    except Exception as e:
        return f"Error: All scraping attempts failed ({str(e)})"