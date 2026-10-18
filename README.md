<p align="center">
  <img src="client/public/logo.png" alt="InterviewAce AI Logo" width="220" />
</p>

# InterviewAce AI

AI mock-interview platform: upload a resume, generate role-specific questions with Gemini, answer under a timer, get scored feedback, and track progress.

**Stack:** React (Vite) · Tailwind · Framer Motion · Recharts · Context API · Node/Express · MongoDB Atlas (Mongoose) · JWT + bcrypt · Cloudinary · Gemini API

## Setup

Requires Node 18+.

```bash
# 1. API
cd server && cp .env.example .env     # fill in MONGO_URI, JWT_SECRET, Cloudinary, GEMINI_API_KEY
npm install && npm run dev            # http://localhost:5000

# 2. Web (new terminal)
cd client && npm install && npm run dev   # http://localhost:5173 (proxies /api)
```

Atlas: allow your IP under Network Access. Gemini key: https://aistudio.google.com/apikey

## API

| Method | Route | Notes |
|---|---|---|
| POST | /api/auth/register, /login | returns `{ token, user }` |
| POST | /api/auth/forgot-password, /reset-password/:token | dev mode returns the link; wire an email provider in `auth.controller.js` |
| GET/PUT | /api/auth/me, /profile, /password | profile accepts `avatar` image upload |
| POST | /api/resume/upload | multipart field `resume` (PDF, 5 MB) |
| GET/DELETE | /api/resume, /api/resume/:id | |
| POST | /api/interview/generate | `{ role, difficulty, type, skills? }` returns 10 questions |
| POST | /api/interview/submit | `{ interviewId, answers[] }` scores all answers in one Gemini call |
| GET | /api/interview/history, /api/interview/:id | |
| GET | /api/dashboard/stats | totals, trend, skills, type and difficulty splits |

## Production notes

- Deploy API (Render/Railway/Fly) and set `CLIENT_URL` to your frontend origin; deploy `client/dist` to Vercel/Netlify with `VITE_API_URL` set and an SPA rewrite to `index.html`.
- Included: helmet, CORS allow-list, rate limits (auth and AI endpoints), input validation, bcrypt (12 rounds, via `bcryptjs`), hashed reset tokens, central error handler, graceful shutdown.
- Next steps: email provider for resets, refresh tokens or httpOnly cookies, route-level code splitting, tests, plan limits/billing.
