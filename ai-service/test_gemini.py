from google import genai
from dotenv import load_dotenv
import os

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

try:
    print("Testing Embedding Model: gemini-embedding-001")
    emb_resp = client.models.embed_content(
        model='gemini-embedding-001',
        contents="test text"
    )
    print("EMBEDDING SUCCESS")
    
    print("Testing Chat Model: gemini-2.0-flash")
    gen_resp = client.models.generate_content(
        model='gemini-2.0-flash',
        contents="Hello"
    )
    print(f"GENERATION SUCCESS: {gen_resp.text[:50]}...")
except Exception as e:
    print(f"FAILED: {e}")
