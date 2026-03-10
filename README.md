# JobSense AI – Smart Job Matcher & ATS Analyzer

A full-stack web application that helps job seekers optimize their resumes by analyzing them against job descriptions using AI-powered ATS scoring, keyword gap analysis, and improvement suggestions.

## 🎯 Features

### MVP Features
- ✅ User authentication (JWT-based)
- ✅ Resume upload and parsing (PDF/DOCX)
- ✅ Job description input and storage
- ✅ ATS scoring engine with keyword matching
- ✅ Gap analysis (missing keywords, skill gaps)
- ✅ Improvement suggestions
- ✅ Analysis history and analytics dashboard

### Advanced Features
- 🔄 Semantic matching using embeddings
- 🔄 Skill tags and profile building
- 🔄 Advanced analytics with charts
- 🔄 AI-powered suggestions using LLM

## 🏗️ Architecture

```
jobsense-ai/
├── frontend/          # Next.js + TypeScript + Tailwind CSS
├── backend/           # Node.js + Express API
├── ai-service/        # Python FastAPI for NLP/embeddings
└── README.md
```

## 🚀 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Prisma ORM
- **AI Service**: Python, FastAPI, sentence-transformers
- **Database**: PostgreSQL
- **Auth**: JWT tokens

## 📦 Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+

### Installation

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables:**
   - Copy `.env.example` files in each directory
   - Configure database connection and JWT secrets

3. **Set up database:**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Set up Python service:**
   ```bash
   cd ai-service
   pip install -r requirements.txt
   ```

5. **Run development servers:**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

### Frontend (`/frontend`)
- Pages: `/login`, `/register`, `/dashboard`, `/analysis/[id]`, `/profile`
- Components: Auth, ResumeUpload, JobDescription, AnalysisResults, Analytics

### Backend (`/backend`)
- API routes: `/api/auth/*`, `/api/resume/*`, `/api/job/*`, `/api/analysis/*`, `/api/analytics/*`
- Services: Auth, Resume parsing, ATS scoring
- Database: Prisma schema and migrations

### AI Service (`/ai-service`)
- Endpoints: `/extract-text`, `/compute-embeddings`, `/score-resume-vs-jd`
- Models: Sentence transformers for embeddings

## 🔐 Environment Variables

### Backend
```
DATABASE_URL="postgresql://user:password@localhost:5432/jobsense"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3001
```

### Frontend
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### AI Service
```
PORT=8000
```

## 📝 API Documentation

See the backend code directly or explore the endpoints under `/backend/src/routes`.

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 🚢 Deployment

- Frontend: Vercel
- Backend: Render/Railway
- AI Service: Render/Railway
- Database: Neon/Supabase

## 📄 License

MIT

