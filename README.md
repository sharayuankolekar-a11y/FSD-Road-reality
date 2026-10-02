# Road Reality 🚗💥

A crowdsourced road-hazard intelligence platform built with **React**, **Vite**, **Tailwind CSS**, **Leaflet**, **Express/Node.js**, and **Supabase (Auth & Database)**.

Road Reality helps drivers discover real-time hazards near their actual location, submit verified road reports (potholes, waterlogging, fallen trees, broken streetlights), and track reports from discovery to resolution.

---

## 🏗️ Architecture

```
  ┌─────────────────────────────────────────────────────────┐
  │                 Frontend (React + Vite)                 │
  │     http://localhost:5173  (Leaflet Map + UI)           │
  └───────────┬─────────────────────────────────┬───────────┘
              │                                 │
   Supabase Auth (Google OAuth)       REST API Calls (Bearer Token)
              │                                 │
              ▼                                 ▼
  ┌───────────────────────┐         ┌───────────────────────┐
  │ Supabase Cloud Auth   │         │ Express Backend       │
  │ (OAuth / Sessions)    │         │ http://localhost:5000 │
  └───────────────────────┘         └───────────┬───────────┘
                                                │
                                    Database Queries (RLS)
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │ Supabase PostgreSQL   │
                                    │ (profiles & reports)  │
                                    └───────────────────────┘
```

### Flow Summaries

1. **Authentication Flow**:
   ```
   User -> "Sign in with Google" -> Supabase Auth (OAuth) -> Redirect -> User Session Restored -> Backend Role Check -> Logged in State
   ```

2. **Location Flow**:
   ```
   Browser Geolocation API (navigator.geolocation) -> Latitude / Longitude -> Map View / Nearby Hazards API -> Real-Time Nearby Reports
   ```

3. **Admin Flow**:
   ```
   Google Login -> Supabase Auth -> Backend verifies JWT + DB `profiles.role === 'admin'` -> Access granted to /admin dashboard
   ```

---

## ⚙️ Environment Variables

### Frontend Environment Variables (`.env` at root)
Create a `.env` file in the project root directory:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
VITE_API_BASE_URL=http://localhost:5000/api
```
*(Note: Never place `SUPABASE_SERVICE_ROLE_KEY` inside frontend source code or frontend `.env`)*

### Backend Environment Variables (`backend/.env`)
Create a `.env` file in the `backend` directory:

```env
PORT=5000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
CLIENT_ORIGIN=http://localhost:5173
ADMIN_EMAIL=admin@example.com
```

---

## 🚀 Running the Project

### 1. Run Backend Server (Port 5000)
```bash
cd backend
npm install
npm run dev
```

### 2. Run Frontend App (Port 5173)
```bash
# In project root
npm install
npm run dev
```

---

## 🗄️ Database Setup (Supabase SQL Schema)

Run the SQL migration file located at `backend/schema.sql` in the **Supabase SQL Editor**:

```sql
-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  hazard_type TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  traffic_affected BOOLEAN DEFAULT FALSE,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'REPORTED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔑 Supabase & Google OAuth Configuration

1. **Enable Google Provider in Supabase**:
   - Go to **Supabase Dashboard** -> **Authentication** -> **Providers**.
   - Enable **Google**.
   - Add your Google OAuth **Client ID** and **Client Secret** (from Google Cloud Console).
2. **Configure Redirect URLs**:
   - Go to **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
   - Set Site URL: `http://localhost:5173`
   - Add Redirect URLs: `http://localhost:5173/login`, `http://localhost:5173/`
3. **Setting Up Admin Role**:
   - Run the following query in Supabase SQL Editor to make a user an Admin:
     ```sql
     UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
     ```
   - Alternatively set `ADMIN_EMAIL=your-email@example.com` in `backend/.env`.

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/reports` | Get all hazard reports | No |
| `GET` | `/api/reports/nearby?lat=...&lng=...&radius=...` | Get nearby reports by coordinates | No |
| `GET` | `/api/reports/:id` | Get hazard report by ID | No |
| `GET` | `/api/reports/stats` | Get report statistics for dashboard | No |
| `GET` | `/api/reports/my-reports` | Get user's submitted reports | Yes |
| `POST` | `/api/reports` | Report a new road hazard | Optional (Attaches user_id if logged in) |
| `PUT` | `/api/reports/:id/status` | Update hazard report status | **Admin Only** |
| `DELETE` | `/api/reports/:id` | Delete hazard report | Admin or Report Owner |
| `GET` | `/api/auth/profile` | Get current user profile & role | Yes |
