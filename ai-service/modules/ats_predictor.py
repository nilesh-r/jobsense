import os
import pickle
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from pydantic import BaseModel
from typing import List

MODEL_PATH = os.path.join(os.path.dirname(__file__), "ats_rf_model.pkl")

# Generate Synthetic Data & Train Model if it doesn't exist
def train_model():
    print("Training synthetic ATS Scoring Random Forest Model...")
    # Features: [keyword_density (0-1), skill_coverage (0-1), section_completeness (0-1), readability (0-100), exp_alignment (0-1)]
    # Target: ATS Score (0-100)
    
    # Generate 1000 synthetic samples
    np.random.seed(42)
    X = np.random.rand(1000, 5)
    X[:, 3] = X[:, 3] * 100  # readability scale 0-100
    
    # Create a target somewhat correlated with features
    # Base is 20 + 30*keyword + 20*skill + 10*completeness + 0.1*readability + 10*exp_alignment + noise
    y = 20 + (30 * X[:, 0]) + (20 * X[:, 1]) + (10 * X[:, 2]) + (0.1 * X[:, 3]) + (10 * X[:, 4])
    y = y + np.random.normal(0, 5, 1000)
    y = np.clip(y, 10, 100) # clip to 10-100 range
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    
    return model

def get_model():
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)
    return train_model()

def predict_ats(features: dict) -> dict:
    """
    Expects features dict:
    {
      "keyword_density": float (0-1),
      "skill_coverage": float (0-1),
      "section_completeness": float (0-1),
      "readability_score": float (0-100),
      "experience_alignment": float (0-1)
    }
    """
    model = get_model()
    
    # Extract features in order
    x_input = np.array([[
        features.get("keyword_density", 0.5),
        features.get("skill_coverage", 0.5),
        features.get("section_completeness", 0.8),
        features.get("readability_score", 60.0),
        features.get("experience_alignment", 0.5)
    ]])
    
    prediction = model.predict(x_input)[0]
    score = np.clip(prediction, 0, 100)
    
    # Calculate probability and strength
    interview_prob = np.clip((score - 40) / 0.6, 5, 95)  # Scale roughly
    
    if score >= 80:
        strength = "strong"
    elif score >= 60:
        strength = "medium"
    else:
        strength = "weak"
        
    missing_sections = []
    if features.get("section_completeness", 1.0) < 0.8:
        missing_sections.append("Projects or Certifications section may be weak")
        
    return {
        "predicted_score": round(score),
        "interview_probability": round(interview_prob),
        "missing_sections": missing_sections,
        "resume_strength": strength
    }
