from google import genai
from dotenv import load_dotenv
import os

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

try:
    print("Listing ALL models:")
    models = list(client.models.list())
    for model in models:
        print(f"Name: {model.name}")
except Exception as e:
    print(f"Error listing models: {e}")
