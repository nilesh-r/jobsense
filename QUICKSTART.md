# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# AI Service
cd ../ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Set Up Database

1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE jobsense;
```

2. Configure backend `.env`:
```bash
cd backend
# Copy .env.example to .env and edit:
DATABASE_URL="postgresql://user:password@localhost:5432/jobsense"
JWT_SECRET="change-this-secret-key"
```

3. Run migrations:
```bash
npx prisma generate
npx prisma migrate dev
```

### Step 3: Configure Environment

**Backend** (`backend/.env`):
```
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
PORT=3001
AI_SERVICE_URL="http://localhost:8000"
CORS_ORIGIN="http://localhost:3000"
```

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Step 4: Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - AI Service:**
```bash
cd ai-service
source venv/bin/activate
python main.py
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 5: Access Application

- 🌐 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:3001
- 🤖 AI Service: http://localhost:8000/docs

## 📝 First Steps

1. **Register** a new account at http://localhost:3000/register
2. **Upload** a resume (PDF or DOCX)
3. **Add** a job description
4. **Analyze** your resume against the job
5. **View** your analytics dashboard

## 🐛 Troubleshooting

**Database connection error?**
- Check PostgreSQL is running
- Verify DATABASE_URL format
- Ensure database exists

**AI service not working?**
- Check Python service is running on port 8000
- Verify all Python dependencies installed
- Check backend AI_SERVICE_URL

**CORS errors?**
- Verify CORS_ORIGIN in backend .env matches frontend URL

## 📚 More Information

See `SETUP.md` for detailed setup instructions.
See `PROJECT_SUMMARY.md` for project overview.

