import os
import requests

def test_ats():
    base_url = os.getenv("API_URL", "http://localhost:8000")
    print(f"Testing AI Service ATS score endpoint directly at {base_url}...")
    try:
        res = requests.post(
            f"{base_url}/score-resume-vs-jd",
            json={
                "resume_text": "Experienced software engineer skilled in Python, React, and Node.js.",
                "job_description": "Looking for a software engineer with Python, React, and AWS."
            },
            timeout=120
        )
        print(f"Status: {res.status_code}")
        print("Response JSON:")
        print(res.json())
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_ats()
