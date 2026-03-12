import json
from google import genai
from google.genai import types

def rewrite_resume_bullets(bullets: list[str], client: genai.Client) -> dict:
    prompt = """
    Role: Expert Resume Writer & Career Coach.
    Task: Rewrite the following resume bullet points to be more impactful, using the action-context-result format.
    
    Bullets to rewrite:
    {bullets}
    
    Process:
    1. Upgrade weak action verbs.
    2. Add placeholder metrics or highlight where measurable achievements should go (e.g., "[X]%").
    3. Make sentences concise and powerful.
    
    Return a JSON response matching exactly this format:
    {{
      "improved_bullets": ["Improved bullet 1", "Improved bullet 2"],
      "suggested_action_verbs": ["List", "Of", "Strong", "Verbs"]
    }}
    """
    
    text_input = "\\n".join(f"- {b}" for b in bullets)
    
    response = client.models.generate_content(
        model='gemini-1.5-flash',
        config=types.GenerateContentConfig(
            response_mime_type='application/json',
            temperature=0.3,
        ),
        contents=prompt.format(bullets=text_input),
    )
    
    return json.loads(response.text)
