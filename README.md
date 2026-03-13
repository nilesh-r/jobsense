# 🚀 JobSense AI: Your Smart Job Matcher & ATS Analyzer

Welcome to **JobSense AI**, a cutting-edge full-stack web application designed to empower job seekers. In today's competitive job market, getting past the Applicant Tracking System (ATS) is half the battle. JobSense AI leverages advanced Artificial Intelligence to analyze your resume against job descriptions, providing you with actionable insights, intelligent scoring, and a strategic edge to land your dream job.

![JobSense AI Banner](https://via.placeholder.com/1200x400?text=JobSense+AI+-+Unlock+Your+Career+Potential) <!-- Replace with an actual screenshot or banner -->

---

## 🔗 Deployment Links

*   **Live Application:** [https://jobsense-frontend.vercel.app/]
*   **Backend API:** [https://jobsense.onrender.com]
*   **AI Service API:** [https://jobsense-4.onrender.com]

---

## ✨ Why JobSense AI?

Many great candidates are filtered out simply because their resumes don't speak the same language as the job description. JobSense AI bridges that gap. We don't just look for keywords; we use semantic understanding to evaluate your true fit for a role, just like a human recruiter would—but faster and more accurately.

### 🌟 Core Features

*   **🧠 Intelligent ATS Scoring:** Our AI engine deeply analyzes your resume against target job descriptions, providing a comprehensive score based on keyword density, skill matching, and experience alignment.
*   **🔍 Keyword Gap Analysis:** Instantly discover which critical skills or keywords you're missing. We highlight the exact terms recruiters are looking for, so you can tailor your resume effectively.
*   **💡 Actionable Improvement Suggestions:** Get concrete, AI-generated suggestions on how to improve your resume's impact, formatting, and content to increase your chances of securing an interview.
*   **🤖 Conversational AI Coach:** Have questions about your resume strategy? Chat directly with our integrated AI coach (powered by Gemini) for personalized advice and dynamic feedback.
*   **📊 Insightful Analytics Dashboard:** Track your progress over time with advanced visualizations. Monitor skill coverage, receive job match recommendations, and access career roadmap suggestions.
*   **🎯 Semantic Skill Extraction Engine:** Detects technical and conceptual skills from resumes and job descriptions using embedding-based semantic matching.
*   **📈 ATS Score Prediction Model:** Machine learning model that predicts resume success probability and interview likelihood.
*   **✍️ AI Resume Rewriter:** Automatically rewrites resume bullet points to improve clarity, impact, and ATS optimization.
*   **💼 Job Recommendation Engine:** Recommends job roles based on resume skills using embedding similarity.
*   **🛣️ Career Gap Analyzer:** Compares resume skills with target job roles and generates a learning roadmap.
*   **🙋 Interview Question Generator:** Generates technical and behavioral interview questions based on resume content.
*   **🔒 Secure User Accounts:** Your data is safe with us. We use robust JWT-based authentication and secure database storage for your resumes and analyses.
*   **📄 Seamless Parsing:** Upload your resume in PDF or DOCX format, and our system will accurately extract the text for analysis.

---

## 🏗️ System Architecture

JobSense AI is built with modern, scalable technologies, divided into three core microservices:

```mermaid
graph TD;
    subgraph Client_Layer [Frontend: Next.js + React]
        UI[UI Components]
        State[React Query / Auth State]
    end

    subgraph Server_Layer [Backend: Node.js + Express]
        API[REST API Gateway]
        Parser[File Parser PDF/DOCX]
        Auth[JWT / Passport Auth]
    end

    subgraph AI_Layer [AI Service: FastAPI + Python]
        Extractor[Skill Extraction Engine]
        Predictor[ATS Prediction Model]
        Rewriter[AI Resume Rewriter]
        Recommender[Job Recommendation Engine]
        Analyzer[Career Gap Analyzer]
        Generator[Interview Question Generator]
    end

    Database[(PostgreSQL Database)]

    UI <-->|JSON/HTTPS| API
    API <-->|REST API| AI_Layer
    API <-->|Prisma ORM| Database
    Parser --- API
    Auth --- API
```

1.  **Frontend (`/frontend`)**: The user-facing application, providing a beautiful, responsive, and intuitive interface with light and dark mode support.
2.  **Backend (`/backend`)**: The core server handling business logic, user authentication, file uploads, database interactions, and orchestrating requests to the AI service.
3.  **AI Service (`/ai-service`)**: A specialized Python microservice dedicated to heavy lifting: natural language processing, semantic matching, and generating AI insights. Key modules include:
    *   **Skill Extraction Engine:** Performs semantic parsing of skills using embeddings.
    *   **ATS Prediction Model:** An ML model predicting application success probability.
    *   **Resume Rewriter:** Automatically enhances resume content for maximum ATS compatibility.
    *   **Job Recommendation Engine:** Recommends tailored roles based on skill similarity.
    *   **Career Gap Analyzer:** Identifies skill deficiencies and suggests specific learning paths.
    *   **Interview Question Generator:** Creates context-aware interview preparation materials.

---

## 🛠️ The Tech Stack

We've carefully selected a modern stack to ensure performance, reliability, and an excellent developer experience.

### 🎨 Frontend
*   **Framework:** Next.js 14 (App Router)
*   **UI Library:** React 18
*   **Styling:** Tailwind CSS (with advanced theme-aware capabilities)
*   **Language:** TypeScript
*   **State & Data Fetching:** React Query (`@tanstack/react-query`)
*   **Animations:** Framer Motion
*   **Charts:** Recharts

### ⚙️ Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **ORM:** Prisma
*   **Database:** PostgreSQL
*   **Authentication:** JWT, Passport.js (Google OAuth support)
*   **File Parsing:** `pdf-parse`, `mammoth` (for DOCX)
*   **Language:** TypeScript

### 🧠 AI Service
*   **Framework:** FastAPI (Python)
*   **Server:** Uvicorn
*   **AI Models:** Google GenAI (`gemini-2.0-flash`), Sentence Transformers (for semantic embeddings)
*   **Machine Learning:** Random Forest / XGBoost models for predictive scoring
*   **Search Engine:** Cosine similarity search for job recommendations
*   **Data Validation:** Pydantic

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites

*   **Node.js** (v18 or higher)
*   **Python** (v3.10 or higher)
*   **PostgreSQL** (v14 or higher) - *Make sure it's running and you have created a database for the project.*
*   **API Keys:** You will need a Google AI Studio API Key (for Gemini) and optionally Google OAuth credentials if you want to test social login.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/jobsense-ai.git
    cd jobsense-ai
    ```

2.  **Install Global Dependencies (if applicable):**
    We recommend using a root-level script if available, otherwise, install dependencies in each directory.
    ```bash
    # If a root package.json exists:
    npm run install:all 
    ```

3.  **Environment Configuration:**
    You need to set up environment variables for all three services. We've provided `.env.example` files in each directory.

    *   **Backend (`/backend/.env`):**
        ```env
        DATABASE_URL="postgresql://user:password@localhost:5432/jobsense"
        JWT_SECRET="your_super_secret_jwt_key"
        JWT_EXPIRES_IN="7d"
        PORT=3001
        # Add Google OAuth variables if needed
        ```
    *   **Frontend (`/frontend/.env.local`):**
        ```env
        NEXT_PUBLIC_API_URL="http://localhost:3001"
        ```
    *   **AI Service (`/ai-service/.env`):**
        ```env
        PORT=8000
        GEMINI_API_KEY="your_google_gemini_api_key"
        ```

4.  **Database Initialization (Backend):**
    ```bash
    cd backend
    npm install
    npx prisma generate
    npx prisma migrate dev --name init
    ```

5.  **Python Environment Setup (AI Service):**
    We highly recommend using a virtual environment.
    ```bash
    cd ../ai-service
    python -m venv venv
    
    # Activate virtual environment
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    # source venv/bin/activate
    
    pip install -r requirements.txt
    ```

### Running the Application

To run the full stack locally, you need to start all three services in separate terminal windows.

**Terminal 1: Backend**
```bash
cd backend
npm run dev
```

**Terminal 2: AI Service**
```bash
cd ai-service
# Make sure your virtual environment is activated
uvicorn main:app --reload --port 8000
```

**Terminal 3: Frontend**
```bash
cd frontend
npm install # if not already done
npm run dev
```

Once all services are running, open your browser and navigate to `http://localhost:3000` to start using JobSense AI!

---

## 🧪 Testing

We value code quality. Run the test suites for the respective services:

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test
```

Currently, the AI service contains several local test scripts (e.g., `test_ats.py`, `test_auth_chat.py`) that can be run directly using Python to verify AI responses and scoring mechanisms.

---

## 🚢 Deployment Overview

JobSense AI is designed to be cloud-native and easily deployable. Here is our recommended deployment strategy:

*   **Frontend:** [Vercel](https://vercel.com/) (Next.js native support provides the best experience).
*   **Backend:** [Render](https://render.com/) or [Railway](https://railway.app/) as a Node.js web service.
*   **AI Service:** [Render](https://render.com/) or [Railway](https://railway.app/) as a Python web service (ensure port binding uses the `$PORT` environment variable).
*   **Database:** A managed PostgreSQL instance like [Neon](https://neon.tech/) or [Supabase](https://supabase.com/).

*Please refer to `DEPLOYMENT_CHECKLIST.md` for detailed production deployment steps.*

---

## 🤝 Contributing

We welcome contributions! Please to read our contributing guidelines (coming soon) and feel free to submit Pull Requests.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
