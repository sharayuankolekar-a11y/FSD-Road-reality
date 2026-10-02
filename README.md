# Road Reality — Frontend

A React + Vite + Tailwind frontend starter for the Road Reality crowdsourced hazard network. It is intentionally usable in **mock mode** until Suhas and Shravya provide their integrations.

## Run
```bash
npm install
npm run dev
```
Open the local URL Vite prints.

## What is included
- Responsive landing, authentication, map explore, details, report wizard, my reports, profile, notifications, and admin dashboard routes.
- Leaflet + OpenStreetMap map with realistic in-memory mock hazards.
- Reusable badges, cards, navigation, map, empty/error/loading states, and toast feedback.
- A small API adapter at `src/services/hazardService.js`. Set `VITE_API_BASE_URL` to move from mock data to Suhas’s API without rewriting page components.

## Backend contract needed
`GET /hazards?category=&severity=&status=&lat=&lng=` → `{ data: Hazard[] }`  
`GET /hazards/:id` → `{ data: Hazard }`  
`POST /hazards` accepts `{category, image?, latitude, longitude, address, severity, trafficImpact, description}` → `{data: Hazard}`  
`GET /me/hazards` → `{data: Hazard[]}`  
`PATCH /hazards/:id/status` accepts `{status}` → `{data: Hazard}`

Return errors as `{ message: "Human-readable message", code?: "..." }` with an appropriate HTTP status. Backend must validate permissions and input; client validation is only for UX.

### Hazard fields
`id, category, imageUrl, latitude, longitude, address, severity (low|medium|high|critical), trafficImpact (yes|no|partial), description, status (reported|under_review|verified|in_progress|resolved|rejected), verificationStatus, reportedAt, updatedAt, reporter { id, name }`.

## Supabase dependencies
Shravya needs to provide an auth/session integration (or endpoints backed by it), public/signed image URLs, and the fields above. Do not expose a Supabase service-role key in this frontend.
