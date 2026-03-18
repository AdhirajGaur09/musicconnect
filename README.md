# 🎸 MusicConnect

A full-stack musician collaboration platform where musicians can discover each other, post gigs, form bands, and manage their music career — built with React, FastAPI, and MongoDB Atlas.

![MusicConnect](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

---

## 🚀 Live Demo
**[https://musicconnect-frontend.onrender.com](https://musicconnect-frontend.onrender.com)**

---

## 📌 Features

- 🔐 **JWT Authentication** — Register, login, protected routes with bcrypt password hashing
- 🎵 **Musician Discovery** — Search and filter musicians by city, instrument, genre, and experience
- 🎤 **Gig Marketplace** — Post gigs, apply to gigs, cancel applications, view applicants
- 📊 **User Dashboard** — Overview stats, posted gigs, applications, account settings
- 👤 **Profile Management** — Edit bio, genres, availability, social links, change email/password
- 🛡️ **Admin Panel** — Role-based access control, ban/unban users, platform-wide stats
- ✨ **Modern UI** — Framer Motion animations, loading skeletons, toast notifications, responsive design

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | SPA framework |
| React Router v6 | Client-side routing + protected routes |
| Tailwind CSS | Styling |
| Framer Motion | Page transitions and animations |
| Axios | HTTP client with JWT interceptors |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI (Python) | REST API framework |
| Motor / Beanie | Async MongoDB ODM |
| python-jose | JWT token generation and verification |
| passlib / bcrypt | Password hashing |
| Pydantic v2 | Request/response validation |

### Database & Infrastructure
| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud database (3 collections) |
| Vite | Frontend build tool + dev proxy |

---

## 📁 Project Structure

```
musicconnect/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── database.py          # MongoDB connection
│   │   ├── config.py            # Environment settings
│   │   ├── auth/
│   │   │   ├── jwt.py           # Token create/decode
│   │   │   └── deps.py          # Auth dependencies (get_current_user, get_admin_user)
│   │   ├── models/              # Beanie MongoDB documents
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── routes/              # API route handlers
│   │   └── utils/               # Password hashing utilities
│   ├── seed.py                  # Database seeder (10 users, 8 gigs)
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx  # Global auth state
    │   ├── services/
    │   │   └── api.js           # Axios instance + all API calls
    │   ├── components/
    │   │   ├── common/          # Avatar, Modal, Badge, Skeleton, Field
    │   │   └── layout/          # Navbar, Layout
    │   └── pages/               # Home, Discover, Gigs, Dashboard, Profile, Login, Register
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB Atlas account (free tier)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — add your MongoDB Atlas URL and SECRET_KEY

# Seed sample data
python seed.py

# Start server
uvicorn app.main:app --reload --port 8000
```

API docs available at: **http://localhost:8000/docs**

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open: **http://localhost:5173**

---

## 🔑 API Endpoints

### Authentication
```
POST /api/auth/register    — Register new user
POST /api/auth/login       — Login and get JWT token
```

### Users
```
GET    /api/users          — List musicians (filter: city, role, genre, experience)
GET    /api/users/me       — Get current user profile
PATCH  /api/users/me       — Update profile
GET    /api/users/{id}     — Get public profile
PATCH  /api/users/me/change-password
PATCH  /api/users/me/change-email
```

### Gigs
```
GET    /api/gigs                    — List gigs (filter: city, role, status)
POST   /api/gigs                    — Create gig
GET    /api/gigs/{id}               — Get gig detail
PATCH  /api/gigs/{id}               — Update gig (owner only)
DELETE /api/gigs/{id}               — Delete gig (owner only)
POST   /api/gigs/{id}/apply         — Apply to gig
DELETE /api/gigs/{id}/apply         — Cancel application
GET    /api/gigs/{id}/applicants    — View applicants (owner only)
GET    /api/gigs/my/applications    — My applications
```

### Admin (admin only)
```
GET    /api/admin/stats             — Platform statistics
GET    /api/admin/users             — All users list
PATCH  /api/admin/users/{id}/ban    — Ban user
PATCH  /api/admin/users/{id}/unban  — Unban user
PATCH  /api/admin/users/{id}/promote — Promote to admin
DELETE /api/admin/users/{id}        — Delete user
DELETE /api/admin/gigs/{id}         — Delete any gig
```

---

## 👥 Demo Accounts

After running `python seed.py`:

| Email | Password | Role | City |
|---|---|---|---|
| adhiraj@demo.com | demo1234 | Guitarist | Bangalore |
| priya@demo.com | demo1234 | Vocalist | Bangalore |
| rahul@demo.com | demo1234 | Drummer | Mumbai |
| karthik@demo.com | demo1234 | Producer | Hyderabad |

> **Admin account:** `adhiraj@demo.com` — has access to Admin Panel in Dashboard

---

## 📸 Screenshots

> Add screenshots of your app here after deployment
> Dashboard | Gig Marketplace | Discover Musicians | Admin Panel

---

## 🗄️ Database Schema

### Users Collection
```json
{
  "name": "string",
  "email": "string (unique, indexed)",
  "hashed_password": "string",
  "role": "string",
  "city": "string (indexed)",
  "genres": ["string"],
  "experience": "Beginner | Intermediate | Professional",
  "bio": "string",
  "availability": "Available | Busy | Looking for band",
  "rating": "float",
  "is_admin": "boolean",
  "is_active": "boolean"
}
```

### Gigs Collection
```json
{
  "title": "string",
  "description": "string",
  "city": "string (indexed)",
  "date": "datetime",
  "required_roles": ["string"],
  "payment": "float",
  "payment_type": "Per Gig | Per Hour | Rev Share | ...",
  "status": "open | filled | cancelled | completed (indexed)",
  "created_by": "string (user id)",
  "applicant_count": "integer"
}
```

### Applications Collection
```json
{
  "gig_id": "string (indexed)",
  "applicant_id": "string (indexed)",
  "message": "string",
  "status": "pending | accepted | rejected | cancelled",
  "applied_at": "datetime"
}
```

---

## 🔒 Security

- Passwords hashed with **bcrypt** (passlib)
- **JWT tokens** with configurable expiry (default 7 days)
- All mutation endpoints require authentication via `Bearer` token
- **Admin routes** protected by `get_admin_user` dependency — returns `403 Forbidden` to non-admin users
- Input validation on all endpoints via **Pydantic v2** schemas
- CORS configured to allow only the frontend origin

---

## 🚀 Deployment

### Backend → Render.com
1. Push `backend/` to GitHub
2. New Web Service on Render
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env`

### Frontend → Vercel
1. Import `frontend/` from GitHub
2. Framework: Vite
3. Add env variable: `VITE_API_URL=https://your-render-app.onrender.com`

---

## 👨‍💻 Author

**Adhiraj Gaur**
- GitHub: [@AdhirajGaur09](https://github.com/AdhirajGaur09)
- LinkedIn: [adhiraj-gaur](https://www.linkedin.com/in/adhiraj-gaur-301395297/)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
