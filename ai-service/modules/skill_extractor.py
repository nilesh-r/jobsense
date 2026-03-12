import os
import json
from google import genai
from google.genai import types

# Using Gemini to power the skill extraction as it is more dynamic than a static JSON ontology
def extract_skills(text: str, client: genai.Client) -> dict:
    prompt = """
    Role: Senior Technical Recruiter and Data Scientist.
    Task: Extract all technical and conceptual skills from the provided text.
    
    Text:
    {text}
    
    Process:
    1. Identify all tools, languages, frameworks, and conceptual skills.
    2. Group them into broader categories (e.g., 'React' and 'Next.js' go into 'Frontend Development').
    3. Determine a confidence score (0.0 to 1.0) for each extracted skill based on its context in the text.
    
    Provide the output as a valid JSON object matching this schema exactly:
    {{
      "skills_detected": ["Skill 1", "Skill 2"],
      "skill_categories": {{"Category 1": ["Skill 1"], "Category 2": ["Skill 2"]}},
      "confidence_scores": {{"Skill 1": 0.95, "Skill 2": 0.88}}
    }}
    """
    
    response = client.models.generate_content(
        model='gemini-1.5-flash',
        config=types.GenerateContentConfig(
            response_mime_type='application/json',
            temperature=0.1,
        ),
        contents=prompt.format(text=text),
    )
    
    return json.loads(response.text)
