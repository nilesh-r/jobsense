# Deployment Checklist - JobSense AI

## 🚀 Complete Setup Guide

### 1. **Backend Environment Variables** (`backend/.env`)

Create a `.env` file in the `backend` folder with:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/jobsense?schema=public"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
CORS_ORIGIN="http://localhost:3000"
FRONTEND_URL="http://localhost:3000"

# Google OAuth (Required for Google login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/api/auth/google/callback"

# Session Secret (for OAuth)
SESSION_SECRET="your-session-secret-key"

# AI Service URL
AI_SERVICE_URL="http://localhost:8000"
```

### 2. **Frontend Environment Variables** (`frontend/.env.local`)

Create a `.env.local` file in the `frontend` folder with:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 3. **Database Setup**

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations (creates tables)
npx prisma migrate dev --name init

# Optional: View database in Prisma Studio
npx prisma studio
```

### 4. **Google OAuth Setup**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   - Development: `http://localhost:3001/api/auth/google/callback`
   - Production: `https://your-domain.com/api/auth/google/callback`
7. Copy **Client ID** and **Client Secret** to `backend/.env`

### 5. **AI Service Setup** (`ai-service`)

```bash
cd ai-service

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the service
python main.py
# Or with uvicorn:
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 6. **Install All Dependencies**

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# AI Service
cd ../ai-service
pip install -r requirements.txt
```

### 7. **Run All Services**

You need to run **3 services** simultaneously:

#### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```
Backend will run on: `http://localhost:3001`

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```
Frontend will run on: `http://localhost:3000`

#### Terminal 3 - AI Service:
```bash
cd ai-service
python main.py
# Or: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
AI Service will run on: `http://localhost:8000`

### 8. **Database Migration for New Features**

Since we added new fields (preferences, deletedAt, googleId), run:

```bash
cd backend
npx prisma migrate dev --name add_preferences_and_oauth
```

### 9. **Verify Everything Works**

1. ✅ Backend health check: `http://localhost:3001/health`
2. ✅ AI Service health check: `http://localhost:8000/health`
3. ✅ Frontend loads: `http://localhost:3000`
4. ✅ Register a new user
5. ✅ Login with email/password
6. ✅ Login with Google (if configured)
7. ✅ Upload a resume
8. ✅ Create a job description
9. ✅ Run an analysis
10. ✅ Test AI chat
11. ✅ Test settings page

### 10. **Production Deployment Checklist**

#### Backend (Render/Railway/Heroku):
- [ ] Set all environment variables
- [ ] Update `DATABASE_URL` with production database
- [ ] Update `CORS_ORIGIN` with production frontend URL
- [ ] Update `FRONTEND_URL` with production URL
- [ ] Update `GOOGLE_CALLBACK_URL` with production URL
- [ ] Run `npm run build` before deployment
- [ ] Run `npx prisma migrate deploy` in production

#### Frontend (Vercel/Netlify):
- [ ] Set `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Build should succeed: `npm run build`

#### AI Service (Render/Railway):
- [ ] Set `PORT` environment variable
- [ ] Ensure Python dependencies are installed
- [ ] Service should be accessible from backend

#### Database:
- [ ] Use production PostgreSQL (not local)
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Backup strategy in place

### 11. **Common Issues & Solutions**

#### Issue: "Cannot find module" errors
**Solution**: Run `npm install` in the respective folder

#### Issue: Database connection errors
**Solution**: 
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Run `npx prisma migrate dev`

#### Issue: Google OAuth not working
**Solution**:
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Check redirect URI matches exactly in Google Console
- Ensure Google+ API is enabled

#### Issue: AI Service not responding
**Solution**:
- Check if service is running on port 8000
- Verify `AI_SERVICE_URL` in backend `.env`
- Check AI service logs for errors

#### Issue: CORS errors
**Solution**:
- Update `CORS_ORIGIN` in backend `.env` to match frontend URL
- Ensure backend allows credentials: `credentials: true`

### 12. **Required Packages Summary**

#### Backend (`backend/package.json`):
- ✅ express
- ✅ @prisma/client
- ✅ prisma
- ✅ bcryptjs
- ✅ jsonwebtoken
- ✅ passport
- ✅ passport-google-oauth20
- ✅ express-session
- ✅ cors
- ✅ dotenv
- ✅ multer
- ✅ pdf-parse
- ✅ mammoth
- ✅ axios

#### Frontend (`frontend/package.json`):
- ✅ next
- ✅ react
- ✅ react-dom
- ✅ axios
- ✅ react-hot-toast
- ✅ recharts

#### AI Service (`ai-service/requirements.txt`):
- ✅ fastapi
- ✅ uvicorn
- ✅ sentence-transformers
- ✅ numpy
- ✅ pydantic
- ✅ python-multipart

### 13. **API Endpoints Summary**

#### Authentication:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user

#### Resume:
- `POST /api/resume` - Upload resume
- `GET /api/resume` - Get all resumes
- `GET /api/resume/:id` - Get single resume

#### Job:
- `POST /api/job` - Create job description
- `GET /api/job` - Get all jobs
- `GET /api/job/:id` - Get single job

#### Analysis:
- `POST /api/analysis` - Create analysis
- `GET /api/analysis` - Get all analyses
- `GET /api/analysis/:id` - Get single analysis

#### Analytics:
- `GET /api/analytics/summary` - Get analytics summary

#### Settings:
- `PUT /api/settings/profile` - Update profile
- `POST /api/settings/change-password` - Change password
- `PUT /api/settings/preferences` - Update preferences
- `DELETE /api/settings/clear-analyses` - Clear all analyses
- `DELETE /api/settings/delete-account` - Delete account

#### Chat:
- `POST /api/chat` - Send chat message

### 14. **Quick Start Commands**

```bash
# 1. Setup database
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init

# 2. Setup backend
# Create backend/.env with all variables
npm run dev

# 3. Setup frontend
cd ../frontend
npm install
# Create frontend/.env.local
npm run dev

# 4. Setup AI service
cd ../ai-service
pip install -r requirements.txt
python main.py
```

---

## ✅ You're All Set!

Once all services are running and environment variables are set, your application should be fully functional!

