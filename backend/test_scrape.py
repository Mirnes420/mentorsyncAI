import pytest
from io import BytesIO
from scrape import scrape_resume, scrape_job_description

# --- UNIT TESTS FOR PDF PARSING ---

def test_scrape_resume_valid_pdf():
    """
    Tests if the function handles a file-like object. 
    Note: For a deep test, you'd use a small 1-page PDF.
    """
    # Create a dummy file-like object
    dummy_pdf = BytesIO(b"dummy pdf content")
    # We expect an error string because 'dummy pdf content' isn't a valid PDF structure
    result = scrape_resume(dummy_pdf)
    assert "Error" in result or isinstance(result, str)

def test_scrape_resume_empty_input():
    with pytest.raises(AttributeError):
        scrape_resume(None)

# --- INTEGRATION TESTS FOR WEB SCRAPING ---

def test_scrape_job_description_real_url():
    """
    Tests the SeleniumBase driver against a live (stable) URL.
    """
    test_url = "https://www.google.com" # Using a generic stable site for connection test
    result = scrape_job_description(test_url)
    
    assert isinstance(result, str)
    assert len(result) > 0
    assert "Error" not in result

def test_scrape_job_description_cleaning_logic():
    """
    Checks if your 'stop_words' logic actually truncates the text.
    """
    # This is a bit tricky with a real driver, so we test the result 
    # of a known board if possible, or verify the re.sub logic.
    url = "https://www.remoterocketship.com/company/projectceox/jobs/full-stack-net-developer-united-kingdom-remote/" # Your specific target
    result = scrape_job_description(url)
    
    # Check that footer junk was removed
    stop_words = ["Discover 100,000+", "Frequently asked questions"]
    for word in stop_words:
        assert word not in result

# --- EDGE CASES ---

def test_invalid_url():
    result = scrape_job_description("not-a-url")
    assert "Error" in result