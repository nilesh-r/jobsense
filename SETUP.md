# JobSense AI - Setup Guide

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **PostgreSQL** 14+ (or use a cloud service like Neon/Supabase)

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install Python service dependencies
cd ../ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE jobsense;
```

2. Configure backend environment:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/jobsense?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
AI_SERVICE_URL="http://localhost:8000"
CORS_ORIGIN="http://localhost:3000"
```

3. Run Prisma migrations:
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Python AI Service:**
```bash
cd ai-service
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
# Or: uvicorn main:app --reload --port 8000
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- AI Service: http://localhost:8000
- API Docs: http://localhost:8000/docs (FastAPI Swagger)

## Project Structure

```
jobsense-ai/
├── frontend/          # Next.js frontend
│   ├── app/          # App router pages
│   ├── components/   # React components
│   └── lib/          # Utilities (API, auth)
├── backend/          # Node.js/Express API
│   ├── src/
│   │   ├── routes/   # API routes
│   │   ├── services/ # Business logic
│   │   └── middleware/ # Auth middleware
│   └── prisma/       # Database schema
└── ai-service/       # Python FastAPI service
    └── main.py       # NLP/embedding service
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Resume
- `POST /api/resume` - Upload resume (multipart/form-data)
- `GET /api/resume` - List user resumes
- `GET /api/resume/:id` - Get resume details

### Job
- `POST /api/job` - Create job description
- `GET /api/job` - List user jobs
- `GET /api/job/:id` - Get job details

### Analysis
- `POST /api/analysis` - Create analysis (resumeId, jobId)
- `GET /api/analysis` - List user analyses
- `GET /api/analysis/:id` - Get analysis details

### Analytics
- `GET /api/analytics/summary` - Get analytics summary

## Testing

### Backend
```bash
cd backend
npm test  # (when tests are added)
```

### Frontend
```bash
cd frontend
npm test  # (when tests are added)
```

## Deployment

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set environment variable: `NEXT_PUBLIC_API_URL`
3. Deploy

### Backend (Render/Railway)
1. Set environment variables
2. Run migrations: `npx prisma migrate deploy`
3. Deploy

### AI Service (Render/Railway)
1. Set Python version: 3.10+
2. Install dependencies: `pip install -r requirements.txt`
3. Run: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Database (Neon/Supabase)
1. Create PostgreSQL database
2. Update `DATABASE_URL` in backend environment

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` format
- Ensure database exists

### AI Service Not Responding
- Check Python service is running on port 8000
- Verify `AI_SERVICE_URL` in backend `.env`
- Check Python dependencies are installed

### CORS Errors
- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
- Check frontend `NEXT_PUBLIC_API_URL` matches backend URL

## Next Steps

1. Add unit tests
2. Add error boundaries
3. Implement file storage (S3/Cloudinary) for resumes
4. Add email notifications
5. Enhance AI suggestions with LLM integration
6. Add admin panel

