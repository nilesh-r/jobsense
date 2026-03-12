import numpy as np

def cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    
    if np.linalg.norm(v1) == 0 or np.linalg.norm(v2) == 0:
        return 0.0
        
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))

def recommend_jobs(resume_embedding: list[float], job_postings: list[dict]) -> dict:
    """
    resume_embedding: single embedding vector for the resume
    job_postings: list of dicts {"id": str, "title": str, "description_embedding": list[float], "company": str}
    """
    recommendations = []
    
    for job in job_postings:
        job_emb = job.get("description_embedding")
        if not job_emb:
            continue
            
        score = cosine_similarity(resume_embedding, job_emb)
        match_percentage = round(score * 100, 1)
        
        recommendations.append({
            "job_id": job.get("id", "unknown"),
            "title": job.get("title", "Unknown Role"),
            "company": job.get("company", "Unknown Company"),
            "match_score": match_percentage
        })
        
    # Sort by descending match score
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    
    return {"recommended_roles": recommendations[:10]}  # Return top 10 matches
