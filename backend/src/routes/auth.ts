import express from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const router = express.Router();
const prisma = new PrismaClient();

/* =======================
   ENV & CONSTANTS
======================= */

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN: SignOptions['expiresIn'] =
  (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '7d';

const FRONTEND_URL = (process.env.FRONTEND_URL || '').replace(/\/$/, '');

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is missing');
}

if (!FRONTEND_URL) {
  throw new Error('FRONTEND_URL is missing');
}

/* =======================
   HELPERS
======================= */

const normalizeEmail = (value?: string) =>
  value?.trim().toLowerCase() || '';

const buildFrontendUrl = (
  path: string,
  query?: Record<string, string>
) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${FRONTEND_URL}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
};

type JwtPayload = {
  userId: string;
  email: string;
  role: string;
};

type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
};

/* =======================
   PASSPORT GOOGLE STRATEGY
======================= */

if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL, // MUST be absolute URL
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = normalizeEmail(profile.emails?.[0]?.value);

          if (!email) {
            return done(new Error('Google profile missing email'));
          }

          let dbUser: PrismaUser | null =
            await prisma.user.findUnique({ where: { email } });

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                name: profile.displayName || 'User',
                email,
                passwordHash: null,
                googleId: profile.id,
              },
            });
          } else if (!dbUser.googleId) {
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: { googleId: profile.id },
            });
          }

          const safeUser: SafeUser = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            createdAt: dbUser.createdAt,
          };

          return done(null, safeUser);
        } catch (err) {
          return done(err as any);
        }
      }
    )
  );
}

/* =======================
   GOOGLE AUTH ROUTES
======================= */

// Start Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// Google OAuth Callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: buildFrontendUrl('/login', {
      error: 'google_auth_failed',
    }),
  }),
  async (req, res) => {
    try {
      const user = req.user as SafeUser;

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.redirect(
        buildFrontendUrl('/auth/callback', { token })
      );
    } catch (error) {
      console.error('Google callback error:', error);
      return res.redirect(
        buildFrontendUrl('/login', {
          error: 'google_auth_failed',
        })
      );
    }
  }
);

/* =======================
   REGISTER
======================= */

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = normalizeEmail(email);
    const trimmedName = (name || '').trim();

    if (!trimmedName || !normalizedEmail || !password) {
      return res.status(400).json({
        error: 'All fields are required',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: normalizedEmail,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
});

/* =======================
   LOGIN
======================= */

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        deletedAt: null,
      },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    const isValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
});

/* =======================
   CURRENT USER
======================= */

router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'No token provided',
      });
    }

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    ) as JwtPayload;

    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        preferences: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(401).json({
      error: 'Invalid token',
    });
  }
});

export default router;
