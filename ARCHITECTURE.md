# JobSense AI - Architecture Overview

## System Architecture

```
┌─────────────────┐
│   Frontend      │
│   Next.js 16    │
│   Port: 3000    │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│   Backend API   │
│   Express.js    │
│   Port: 3001    │
└────────┬────────┘
         │
    ┌────┴────┐
    │        │
┌───▼───┐ ┌─▼────────┐
│  DB   │ │ AI       │
│Postgres│ │ Service  │
│       │ │ FastAPI  │
│       │ │ Port:8000│
└───────┘ └──────────┘
```

## Data Flow

### 1. User Registration/Login
```
User → Frontend → Backend API → Database
                ← JWT Token ←
```

### 2. Resume Upload
```
User → Frontend → Backend API → File Parser (PDF/DOCX)
                              → Database (Store parsed text)
```

### 3. Analysis Creation
```
User → Frontend → Backend API → Fetch Resume & Job
                              → Basic ATS Scoring
                              → AI Service (Embeddings)
                              → Combine Scores
                              → Database (Store Analysis)
                              → Return Results
```

### 4. Analytics
```
User → Frontend → Backend API → Database (Aggregate Data)
                              → Return Analytics
```

## Technology Stack

### Frontend Layer
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Notifications**: react-hot-toast

### Backend Layer
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: JWT (jsonwebtoken)
- **File Parsing**: pdf-parse, mammoth

### AI Service Layer
- **Framework**: FastAPI
- **Language**: Python 3.10+
- **NLP**: sentence-transformers
- **Model**: all-MiniLM-L6-v2 (384-dim embeddings)

## Database Schema

### Users Table
- Stores user accounts with hashed passwords
- JWT tokens stored client-side

### Resumes Table
- Links to users
- Stores file metadata and parsed text
- Supports multiple resumes per user

### Jobs Table
- Links to users
- Stores job title, company, and full JD text
- Supports multiple jobs per user

### Analyses Table
- Links users, resumes, and jobs
- Stores comprehensive scoring results
- JSON fields for keywords and suggestions

## Security

### Authentication
- JWT-based stateless authentication
- Passwords hashed with bcrypt (10 rounds)
- Tokens expire after 7 days (configurable)

### Authorization
- Middleware protects all API routes
- Users can only access their own data
- Role-based access (user/admin) ready

### CORS
- Configured for specific origins
- Credentials enabled for cookies (if needed)

## API Design

### RESTful Principles
- Resource-based URLs
- HTTP methods: GET, POST
- JSON request/response format
- Standard HTTP status codes

### Error Handling
- Consistent error response format
- Client-side error interception
- Automatic token refresh handling

## Scalability Considerations

### Current Architecture
- Monolithic backend (can be split)
- Single AI service instance
- Direct database connections

### Future Improvements
- Microservices architecture
- Redis caching for embeddings
- Queue system for analysis jobs
- CDN for file storage
- Database read replicas
- Load balancing

## Performance Optimizations

### Frontend
- Next.js automatic code splitting
- Client-side caching
- Optimistic UI updates

### Backend
- Database indexing on foreign keys
- Efficient queries with Prisma
- Connection pooling

### AI Service
- Lazy model loading
- Embedding caching (future)
- Batch processing support

## Deployment Strategy

### Recommended Platforms
- **Frontend**: Vercel (optimized for Next.js)
- **Backend**: Render, Railway, or AWS
- **AI Service**: Render, Railway, or AWS Lambda
- **Database**: Neon, Supabase, or AWS RDS

### Environment Separation
- Development: Local services
- Staging: Separate environment
- Production: Production database and services

## Monitoring & Logging

### Current
- Console logging in backend
- Error tracking in frontend

### Recommended Additions
- Structured logging (Winston/Pino)
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Analytics (Google Analytics/Mixpanel)

## Testing Strategy

### Unit Tests
- Service functions (ATS scoring)
- Utility functions
- API route handlers

### Integration Tests
- API endpoints
- Database operations
- AI service integration

### E2E Tests
- User flows (Playwright/Cypress)
- Critical paths

## Documentation

### API Documentation
- FastAPI auto-generated docs (Swagger)
- Postman collection (recommended)
- OpenAPI spec (recommended)

### Code Documentation
- TypeScript types as documentation
- JSDoc comments for complex functions
- README files in each service

