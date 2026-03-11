from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="JobSense AI Service", version="1.0.0")

# Setup Gemini AI if key is available
from google import genai
from google.genai import types

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    client = None


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load sentence transformer model (lazy loading)
# Removed local PyTorch model since it causes OOM on free Render instances.
# We will use Gemini embeddings instead.

class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    job_description: str

class ResumeAnalysisResponse(BaseModel):
    similarity: float
    suggestions: List[str]
    matched_skills: List[str]
    missing_skills: List[str]
    detailed_analysis: Optional[Dict[str, Any]] = None

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "AI Service is running"}

@app.post("/score-resume-vs-jd", response_model=ResumeAnalysisResponse)
async def score_resume_vs_jd(request: ResumeAnalysisRequest):
    try:
        if not client:
            raise HTTPException(status_code=500, detail="Gemini API is not configured or unavailable")
            
        # Generate embeddings using batch call to minimize network roundtrips
        embed_response = client.models.embed_content(
            model='gemini-embedding-001',
            contents=[request.resume_text, request.job_description],
        )
        
        resume_embedding = np.array(embed_response.embeddings[0].values)
        jd_embedding = np.array(embed_response.embeddings[1].values)
        
        # Calculate cosine similarity
        similarity = float(np.dot(resume_embedding, jd_embedding) / 
                          (np.linalg.norm(resume_embedding) * np.linalg.norm(jd_embedding)))
        
        # Use Gemini for High-Precision Senior Recruiter Analysis
        analysis_prompt = f"""
        Role: Senior Technical Recruiter & ATS Optimization Expert.
        Task: Perform a deep, "perfect" analysis of the provided Resume against the Job Description (JD).
        
        Resume Content:
        {request.resume_text}
        
        Job Description:
        {request.job_description}
        
        Instructions:
        1. matched_points: Identify specific achievements/experiences in the resume that align with the JD. Quote or rephrase them effectively.
        2. missing_points: Identify critical JD requirements (skills, experience, or certifications) that are completely absent or insufficient in the resume.
        3. action_plan: Provide 3-5 high-impact, actionable steps. Use the format: "Add/Modify '[Original Text]' to '[Optimized Text]' to emphasize [Skill/Impact]".
        4. key_skills_found: List technical tools and hard skills matched.
        5. key_skills_missing: List technical tools and hard skills missing.
        
        Quality Requirements:
        - Be extremely specific. No generic advice.
        - Identify semantic matches (e.g., if JD wants 'Postgres' and resume says 'Relational Databases', mention this gap).
        - Focus on quantifying impact (numbers, percentages).
        
        Return ONLY a JSON object with these keys: 
        "matched_points", "missing_points", "action_plan", "key_skills_found", "key_skills_missing".
        """
        
        analysis_response = client.models.generate_content(
            model='gemini-2.0-flash',
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                temperature=0.2, # Low temperature for consistent, precise analysis
            ),
            contents=analysis_prompt,
        )
        
        import json
        detailed_analysis = json.loads(analysis_response.text)
        
        return ResumeAnalysisResponse(
            similarity=similarity,
            suggestions=detailed_analysis.get('action_plan', []),
            matched_skills=detailed_analysis.get('key_skills_found', []),
            missing_skills=detailed_analysis.get('key_skills_missing', []),
            detailed_analysis=detailed_analysis
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.post("/compute-embeddings")
async def compute_embeddings(texts: List[str]):
    try:
        if not client:
             raise HTTPException(status_code=500, detail="Gemini API is not configured or unavailable")
             
        response = client.models.embed_content(
            model='gemini-embedding-001',
            contents=texts,
        )
        
        embeddings = [emb.values for emb in response.embeddings]
        return {
            "embeddings": embeddings,
            "dimension": len(embeddings[0]) if len(embeddings) > 0 else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing embeddings: {str(e)}")

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[dict]] = []
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    suggestions: List[str] = []

@app.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    try:
        message_lower = request.message.lower()
        
        # If Gemini is available, use it!
        if client:
            # Build conversation history for context
            history = []
            if request.conversation_history:
                for msg in request.conversation_history:
                    role = "user" if msg.get("role") == "user" else "model"
                    history.append(types.Content(role=role, parts=[types.Part.from_text(text=msg.get("content", ""))]))
                    
            chat_session = client.chats.create(
                model='gemini-2.5-flash',
                config=types.GenerateContentConfig(
                    system_instruction=(
                        "You are JobSense AI, an expert career coach and ATS optimization specialist. "
                        "Your goal is to help users improve their resumes, prepare for interviews, "
                        "and understand Applicant Tracking Systems (ATS). You are encouraging, "
                        "constructive, and highly knowledgeable about modern tech hiring practices. "
                        "Keep your responses concise, actionable, and formatted nicely in Markdown."
                    )
                ),
                history=history
            )
            response = chat_session.send_message(request.message)
            
            # Since Gemini generates its own suggestions organically, we can just suggest a few dynamic followups
            # Or use a generic list based on the context.
            suggestions = [
                "How do I quantify my achievements?",
                "What's a good ATS score?",
                "Show me my missing keywords"
            ]
            
            return ChatResponse(
                response=response.text,
                suggestions=suggestions
            )
            
        # Fallback to simple rule-based responses
        if any(word in message_lower for word in ['ats', 'score', 'scoring']):
            response = (
                "Your ATS (Applicant Tracking System) score measures how well your resume matches a job description. "
                "It's calculated based on:\n\n"
                "1. **Keyword Matching** (40%): How many important keywords from the job description appear in your resume\n"
                "2. **Skills Alignment** (40%): How well your technical skills match the required skills\n"
                "3. **Experience Relevance** (20%): How relevant your experience is to the role\n\n"
                "To improve your ATS score:\n"
                "• Include specific keywords from the job description\n"
                "• Match the job title and responsibilities\n"
                "• Use the same terminology as the job posting\n"
                "• Quantify your achievements with numbers"
            )
            suggestions = [
                "How do I find missing keywords?",
                "What's a good ATS score?",
                "How can I improve my skills match?"
            ]
        elif any(word in message_lower for word in ['keyword', 'missing', 'keywords']):
            response = (
                "Missing keywords are important terms from the job description that aren't in your resume. "
                "Here's how to identify and add them:\n\n"
                "1. **Review the job description** for technical skills, tools, and qualifications\n"
                "2. **Check your analysis results** - we highlight missing keywords for you\n"
                "3. **Naturally incorporate them** into your experience and skills sections\n"
                "4. **Use variations** - e.g., 'React' and 'React.js' are both valuable\n\n"
                "Remember: Don't keyword stuff! Add them naturally in context."
            )
            suggestions = [
                "Show me my missing keywords",
                "How do I add keywords naturally?",
                "What if I don't have those skills?"
            ]
        elif any(word in message_lower for word in ['resume', 'improve', 'optimize', 'better']):
            response = (
                "Here are proven strategies to improve your resume:\n\n"
                "**1. Keyword Optimization**\n"
                "• Match keywords from job descriptions\n"
                "• Use industry-standard terminology\n"
                "• Include both acronyms and full terms (e.g., 'API' and 'Application Programming Interface')\n\n"
                "**2. Quantify Achievements**\n"
                "• Use numbers, percentages, and metrics\n"
                "• Show impact: 'Increased sales by 30%' not 'Worked on sales'\n\n"
                "**3. Action Verbs**\n"
                "• Start bullet points with strong verbs: Developed, Implemented, Led, Optimized\n\n"
                "**4. Skills Section**\n"
                "• List technical skills prominently\n"
                "• Match skills to job requirements\n"
                "• Include proficiency levels if relevant"
            )
            suggestions = [
                "How do I quantify my achievements?",
                "What action verbs should I use?",
                "Where should I put my skills?"
            ]
        elif any(word in message_lower for word in ['help', 'hello', 'hi', 'start']):
            response = (
                "Hello! I'm your JobSense AI assistant. I can help you with:\n\n"
                "📊 **ATS Scoring** - Understand how your resume scores\n"
                "🔑 **Keyword Analysis** - Find missing keywords\n"
                "📝 **Resume Optimization** - Get tips to improve your resume\n"
                "💼 **Job Search Tips** - Advice on applications and interviews\n\n"
                "What would you like to know?"
            )
            suggestions = [
                "How does ATS scoring work?",
                "What keywords am I missing?",
                "How can I improve my resume?"
            ]
        else:
            response = (
                "I can help you with ATS scores, keywords, resume improvements, and job search tips. "
                "Try asking:\n\n"
                "• 'How does ATS scoring work?'\n"
                "• 'What keywords am I missing?'\n"
                "• 'How can I improve my resume?'\n"
                "• 'What's a good ATS score?'"
            )
            suggestions = [
                "Explain ATS scoring",
                "Show missing keywords",
                "Resume improvement tips"
            ]
        
        return ChatResponse(
            response=response,
            suggestions=suggestions
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

