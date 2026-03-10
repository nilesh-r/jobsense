import requests

def test_chat():
    print("Testing AI Service Chat endpoint directly...")
    try:
        res = requests.post(
            "https://jobsense-4.onrender.com/chat",
            json={"message": "hello, what can you do?"},
            timeout=60
        )
        print(f"Status: {res.status_code}")
        print("Response JSON:")
        print(res.json())
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_chat()
