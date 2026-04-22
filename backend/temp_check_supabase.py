import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

def test_supabase_tables():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    if not url or not key:
        print("Missing Supabase credentials")
        return
    
    supabase = create_client(url, key)
    
    # Try to see if JobDetails exists
    try:
        res = supabase.table("JobDetails").select("*").limit(1).execute()
        print("JobDetails table exists and is accessible.")
        print(f"Sample data: {res.data}")
    except Exception as e:
        print(f"Error accessing JobDetails: {e}")

    # Try to see if a JobCache table exists
    try:
        res = supabase.table("JobSearchCache").select("*").limit(1).execute()
        print("JobSearchCache table exists.")
    except Exception as e:
        print(f"JobSearchCache table does NOT exist or is inaccessible: {e}")

if __name__ == "__main__":
    test_supabase_tables()
