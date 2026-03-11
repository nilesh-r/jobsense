from google import genai
from dotenv import load_dotenv
import os

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

models_to_test = [
    'text-embedding-004',
    'models/text-embedding-004',
    'embedding-001',
    'models/embedding-001'
]

for model in models_to_test:
    try:
        print(f"Testing model: {model}")
        response = client.models.embed_content(
            model=model,
            contents="test text"
        )
        print(f"SUCCESS: {model}")
        break  # We want to see all or break? Let's NOT break, see all that work!
    except Exception as e:
        print(f"FAILED: {model} - {str(e)[:100]}")
