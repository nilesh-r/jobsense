# JobSense AI Backend

This is the Express backend for JobSense AI.

## Setup

1. Make sure you install the dependencies from the root directory by running `npm run install:all`, or run `npm install` directly in this folder.
2. Initialize and configure the `.env` file using `.env.example` as a template.
3. Make sure you run the Prisma setup before starting the server:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```
4. Start the application with `npm run dev`.

## API Routes

The backend provides several API routes:
- `/api/auth/*` - Authentication endpoints (Register, Login, Google OAuth, Current User)
- `/api/resume/*` - Resume upload and parsing
- `/api/job/*` - Job description management
- `/api/analysis/*` - ATS scoring and matching
- `/api/analytics/*` - User dashboard analytics

See `src/routes/` for specific endpoint implementations.
