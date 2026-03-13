from google import genai
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

try:
    print(client.models.generate_content(model='gemini-1.5-flash', contents="hi").text)
except Exception as e:
    print(f"FAILED: {e}")

client_v1beta = genai.Client(api_key=api_key, http_options={'api_version': 'v1beta'})
try:
    print(client_v1beta.models.generate_content(model='gemini-1.5-flash', contents="hi").text)
except Exception as e:
    print(f"FAILED V1BETA: {e}")
