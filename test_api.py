import os
import requests

def test_chat():
    base_url = os.getenv("API_URL", "http://localhost:8000")
    print(f"Testing AI Service Chat endpoint directly at {base_url}...")
    try:
        res = requests.post(
            f"{base_url}/chat",
            json={"message": "hello, what can you do?"},
            timeout=120
        )
        print(f"Status: {res.status_code}")
        print("Response JSON:")
        print(res.json())
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_chat()
