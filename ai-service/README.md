# JobSense AI Service

Python FastAPI service for NLP and embedding-based resume analysis.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the service:
```bash
python main.py
# Or with uvicorn directly:
uvicorn main:app --reload --port 8000
```

## Endpoints

- `GET /health` - Health check
- `POST /score-resume-vs-jd` - Score resume against job description
- `POST /compute-embeddings` - Compute embeddings for text

## Environment Variables

- `PORT` - Server port (default: 8000)

