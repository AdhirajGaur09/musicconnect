# 🎸 MusicConnect

**A full-stack platform connecting musicians in cities — find bandmates, post gigs, form bands.**

> Built with FastAPI · React · MongoDB Atlas · Tailwind CSS · Framer Motion

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, React Router v6, Tailwind CSS, Framer Motion, Axios |
| Backend    | FastAPI (Python), async with Motor/Beanie ODM   |
| Database   | MongoDB Atlas (free tier works great)           |
| Auth       | JWT (python-jose) + bcrypt password hashing     |
| Deployment | Render (backend) + Vercel (frontend)            |

---

## Project Structure

```
musicconnect/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app + CORS + lifespan
│   │   ├── database.py        # MongoDB + Beanie init
│   │   ├── config.py          # Pydantic settings from .env
│   │   ├── auth/
│   │   │   ├── jwt.py         # Token create/decode
│   │   │   └── deps.py        # get_current_user dependency
│   │   ├── models/
│   │   │   ├── user.py        # User Beanie document
│   │   │   ├── gig.py         # Gig Beanie document
│   │   │   └── application.py # Application Beanie document
│   │   ├── schemas/
│   │   │   ├── user.py        # Pydantic request/response schemas
│   │   │   └── gig.py         # Gig schemas + ApplicationResponse
│   │   ├── routes/
│   │   │   ├── auth.py        # POST /api/auth/register|login
│   │   │   ├── users.py       # GET/PATCH /api/users
│   │   │   └── gigs.py        # Full CRUD + apply/cancel
│   │   └── utils/
│   │       └── security.py    # bcrypt hash/verify
│   ├── seed.py                # Sample data seeder
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── main.jsx           # Entry point
    │   ├── App.jsx            # Routes + ProtectedRoute
    │   ├── index.css          # Global styles + Tailwind
    │   ├── context/
    │   │   └── AuthContext.jsx # Global auth state
    │   ├── services/
    │   │   └── api.js         # Axios instance + all API calls
    │   ├── components/
    │   │   ├── common/        # Avatar, Modal, Badge, Skeleton…
    │   │   └── layout/        # Layout, Navbar
    │   └── pages/
    │       ├── Home.jsx       # Landing page
    │       ├── Discover.jsx   # Musician search + filter
    │       ├── Gigs.jsx       # Gig marketplace + post
    │       ├── Dashboard.jsx  # User dashboard (4 tabs)
    │       ├── Profile.jsx    # Public + own profile
    │       ├── Login.jsx
    │       ├── Register.jsx   # 2-step onboarding
    │       └── NotFound.jsx
    ├── package.json
    ├── vite.config.js         # Dev proxy → localhost:8000
    ├── tailwind.config.js
    └── index.html
```

---

## Quick Start

### 1. MongoDB Atlas Setup
1. Create free account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free M0 cluster
3. Add a database user (username + password)
4. Whitelist your IP (or allow all: `0.0.0.0/0` for dev)
5. Copy the connection string

### 2. Backend Setup

```bash
cd backend

# Copy env file and fill in your values
cp .env.example .env
# Edit .env — set MONGODB_URL and SECRET_KEY

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed sample data (optional but recommended)
python seed.py

# Start dev server
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (proxies /api to localhost:8000)
npm run dev
```

Open: http://localhost:5173

---

## API Reference

### Authentication
```
POST /api/auth/register   → { access_token, user }
POST /api/auth/login      → { access_token, user }
```

### Users
```
GET    /api/users              → List musicians (filter: city, role, genre, experience, search)
GET    /api/users/me           → Current user profile (protected)
PATCH  /api/users/me           → Update profile (protected)
GET    /api/users/{id}         → Public profile
```

### Gigs
```
GET    /api/gigs               → List gigs (filter: city, role, status, search)
POST   /api/gigs               → Create gig (protected)
GET    /api/gigs/{id}          → Gig detail
PATCH  /api/gigs/{id}          → Update gig (owner only)
DELETE /api/gigs/{id}          → Delete gig (owner only)
POST   /api/gigs/{id}/apply    → Apply to gig (protected)
DELETE /api/gigs/{id}/apply    → Cancel application (protected)
GET    /api/gigs/{id}/applicants → View applicants (owner only)
GET    /api/gigs/my/applications → My applications (protected)
```

---

## Demo Accounts

After running `python seed.py`:

| Email             | Password  | Role       | City       |
|-------------------|-----------|------------|------------|
| arjun@demo.com    | demo1234  | Guitarist  | Bangalore  |
| priya@demo.com    | demo1234  | Vocalist   | Bangalore  |
| rahul@demo.com    | demo1234  | Drummer    | Mumbai     |
| karthik@demo.com  | demo1234  | Producer   | Hyderabad  |

---

## Deployment

### Backend → Render.com
1. Push backend folder to a GitHub repo
2. Create new **Web Service** on Render
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env`

### Frontend → Vercel
1. Push frontend folder to GitHub
2. Import project on Vercel
3. Framework: Vite
4. Add env variable: `VITE_API_URL=https://your-render-app.onrender.com`
5. Update `vite.config.js` proxy target to your Render URL for production

---

## Features Implemented

- ✅ JWT Authentication (register + login + protected routes)
- ✅ Musician discovery with multi-filter search
- ✅ Gig marketplace — create, browse, apply, cancel
- ✅ User dashboard with tabs (overview, gigs, applications, settings)
- ✅ Public musician profiles
- ✅ Edit profile (bio, city, genres, availability, social links)
- ✅ Animated UI with Framer Motion page transitions
- ✅ Responsive design (mobile-first)
- ✅ Toast notifications
- ✅ Loading skeletons

## Potential Extensions
- Real-time notifications (WebSocket)
- Musician rating system
- In-app messaging
- Band management module
- File uploads (profile pictures, audio samples)
- Email verification
- Admin dashboard

---

*Built as a portfolio full-stack project demonstrating FastAPI + React + MongoDB architecture.*
