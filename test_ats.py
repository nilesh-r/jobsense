import requests

def test_ats():
    print("Testing AI Service ATS score endpoint directly...")
    try:
        res = requests.post(
            "https://jobsense-4.onrender.com/score-resume-vs-jd",
            json={
                "resume_text": "Experienced software engineer skilled in Python, React, and Node.js.",
                "job_description": "Looking for a software engineer with Python, React, and AWS."
            },
            timeout=60
        )
        print(f"Status: {res.status_code}")
        print("Response JSON:")
        print(res.json())
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_ats()
