import json
from google import genai
from google.genai import types

def generate_interview_questions(resume_text: str, client: genai.Client) -> dict:
    prompt = """
    Role: Senior Technical Interviewer.
    Task: Generate customized technical and behavioral interview questions based on the candidate's resume.
    
    Resume Content:
    {resume}
    
    Process:
    1. Identify key technologies, frameworks, and methodologies listed.
    2. Generate 3-5 challenging technical questions probing deep understanding of those specific technologies (e.g., if Node.js is mentioned, ask about the Event Loop).
    3. Generate 2-3 behavioral questions based on their listed experience and project scale.
    
    Return a exactly JSON response matching this schema:
    {{
      "technical_questions": [
        "Question 1?",
        "Question 2?"
      ],
      "behavioral_questions": [
        "Question 1?",
        "Question 2?"
      ]
    }}
    """
    
    response = client.models.generate_content(
        model='gemini-flash-latest',
        config=types.GenerateContentConfig(
            response_mime_type='application/json',
            temperature=0.3,
        ),
        contents=prompt.format(resume=resume_text),
    )
    
    return json.loads(response.text)
