import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import authRoutes from './routes/auth';
import resumeRoutes from './routes/resume';
import jobRoutes from './routes/job';
import analysisRoutes from './routes/analysis';
import analyticsRoutes from './routes/analytics';
import settingsRoutes from './routes/settings';
import chatRoutes from './routes/chat';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// -------- CORS CONFIG --------
const defaultCorsOrigins = [
  'http://localhost:3000',
  'https://jobsense.onrender.com',
  process.env.FRONTEND_URL,
].filter(Boolean);
const allowedOrigins = (
  process.env.CORS_ORIGIN || defaultCorsOrigins.join(',')
)
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const dynamicOriginPatterns = [
  /\.vercel\.app$/,
  /\.onrender\.com$/,
  /\.railway\.app$/,
  /\.fly\.dev$/,
  /\.netlify\.app$/,
];

const isOriginAllowed = (origin?: string) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  return dynamicOriginPatterns.some(pattern => pattern.test(origin));
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session for OAuth
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
  done(null, user);
});

passport.deserializeUser((user: any, done: (err: any, id?: any) => void) => {
  done(null, user);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/job', jobRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'JobSense AI Backend is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

