import requests

url = "http://127.0.0.1:5555/api/jobs"
payload = {
    'search_term': 'software engineer',
    'location': 'Remote',
    'is_premium': 'false'
}

print(f"Testing {url}...")
try:
    response = requests.post(url, data=payload)
    print(f"Status Code: {response.status_code}")
    data = response.json()
    if data['status'] == 'success':
        print(f"Success! Found {len(data['jobs'])} jobs.")
        if data['jobs']:
            print("First job title:", data['jobs'][0].get('title'))
    else:
        print(f"Fail: {data.get('message')}")
except Exception as e:
    print(f"Request failed: {e}")
