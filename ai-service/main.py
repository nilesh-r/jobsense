from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Optional, Dict, Any
import os

app = FastAPI(title="JobSense AI Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load sentence transformer model (lazy loading)
model = None

def get_model():
    global model
    if model is None:
        print("Loading sentence transformer model...")
        model = SentenceTransformer('all-MiniLM-L6-v2')
        print("Model loaded successfully")
    return model

class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    job_description: str

class ResumeAnalysisResponse(BaseModel):
    similarity: float
    suggestions: List[str]
    matched_skills: List[str]
    missing_skills: List[str]

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "AI Service is running"}

@app.post("/score-resume-vs-jd", response_model=ResumeAnalysisResponse)
async def score_resume_vs_jd(request: ResumeAnalysisRequest):
    try:
        model = get_model()
        
        # Generate embeddings
        resume_embedding = model.encode(request.resume_text)
        jd_embedding = model.encode(request.job_description)
        
        # Calculate cosine similarity
        similarity = float(np.dot(resume_embedding, jd_embedding) / 
                          (np.linalg.norm(resume_embedding) * np.linalg.norm(jd_embedding)))
        
        # Simple keyword extraction for suggestions
        resume_lower = request.resume_text.lower()
        jd_lower = request.job_description.lower()
        
        # Extract potential skills from JD
        common_skills = [
            'python', 'javascript', 'typescript', 'react', 'node', 'express',
            'sql', 'mongodb', 'postgresql', 'aws', 'docker', 'kubernetes',
            'html', 'css', 'angular', 'vue', 'nextjs', 'graphql', 'rest', 'api',
            'java', 'spring', 'django', 'flask', 'fastapi', 'git', 'ci/cd'
        ]
        
        matched_skills = [skill for skill in common_skills 
                         if skill in jd_lower and skill in resume_lower]
        missing_skills = [skill for skill in common_skills 
                         if skill in jd_lower and skill not in resume_lower]
        
        # Generate suggestions
        suggestions = []
        if similarity < 0.5:
            suggestions.append("Your resume has low semantic similarity to the job description. Consider aligning your experience and skills more closely.")
        if len(missing_skills) > 0:
            suggestions.append(f"Consider adding these skills: {', '.join(missing_skills[:5])}")
        if len(matched_skills) < 3:
            suggestions.append("Try to highlight more relevant technical skills in your resume.")
        
        return ResumeAnalysisResponse(
            similarity=similarity,
            suggestions=suggestions,
            matched_skills=matched_skills[:10],
            missing_skills=missing_skills[:10]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.post("/compute-embeddings")
async def compute_embeddings(texts: List[str]):
    try:
        model = get_model()
        embeddings = model.encode(texts)
        return {
            "embeddings": embeddings.tolist(),
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
        
        # Simple rule-based responses (can be enhanced with LLM)
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

