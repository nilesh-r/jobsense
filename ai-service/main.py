from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Optional
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

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

