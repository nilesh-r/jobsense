from google import genai
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-pro']

for m in models:
    try:
        res = client.models.generate_content(model=m, contents="hi")
        print(f"SUCCESS: {m}")
    except Exception as e:
        print(f"FAILED {m}: {str(e)[:150]}")
