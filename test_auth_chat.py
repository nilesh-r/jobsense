import requests
import time

def test_full_flow():
    base_url = "https://jobsense.onrender.com/api"
    print("Registering test user...")
    try:
        # 1. Register
        timestamp = int(time.time())
        res = requests.post(f"{base_url}/auth/register", json={
            "name": "Test User",
            "email": f"test{timestamp}@example.com",
            "password": "password123"
        })
        if res.status_code >= 400:
            print(f"Register failed: {res.text}")
            return
            
        token = res.json().get("token")
        print(f"Got token: {token[:10]}...")
        
        # 2. Chat
        headers = {"Authorization": f"Bearer {token}"}
        chat_res = requests.post(
            f"{base_url}/chat",
            json={"message": "What is the capital of France?"},
            headers=headers
        )
        print(f"Chat status: {chat_res.status_code}")
        print("Chat response:")
        print(chat_res.json())
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_full_flow()
