import json
from google import genai
from google.genai import types

def analyze_career_gap(resume_text: str, target_job: str, client: genai.Client) -> dict:
    prompt = """
    Role: Expert Career Strategist & Technical Mentor.
    Task: Compare the provided Resume against the Target Job Description/Role to identify skill gaps and create a learning roadmap.
    
    Candidate Resume:
    {resume}
    
    Target Role / Job Description:
    {job}
    
    Process:
    1. Identify critical skills, technologies, or experiences required for the target role that are completely missing or weak in the resume.
    2. Suggest specific, modern technologies or frameworks they should learn to bridge this gap.
    3. Provide a structured, high-level learning roadmap (step-by-step).
    4. Estimate a realistic time to learn these skills (e.g., "3-6 months").
    
    Return EXACTLY a JSON response matching this schema:
    {{
      "missing_skills": ["Skill 1", "Skill 2"],
      "recommended_technologies": ["Tech 1", "Tech 2"],
      "learning_roadmap": [
        "Phase 1: Do X",
        "Phase 2: Build Y",
        "Phase 3: Master Z"
      ],
      "estimated_learning_time": "3 months"
    }}
    """
    
    response = client.models.generate_content(
        model='gemini-1.5-flash',
        config=types.GenerateContentConfig(
            response_mime_type='application/json',
            temperature=0.2,
        ),
        contents=prompt.format(resume=resume_text, job=target_job),
    )
    
    return json.loads(response.text)
