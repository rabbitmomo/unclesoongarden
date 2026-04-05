# Uncle Soon Garden

Uncle Soon Garden is a smart gardening companion for home growers and small farms. It combines a React + Vite frontend with a FastAPI backend, using Supabase for data storage and AI-assisted crop analysis for plant health, ripeness, stress, pest, and disease guidance.

## What it does

- Tracks plant care tasks and daily check-ins.
- Shows garden progress, plant status, and grower advice from Uncle Soon.
- Lets users upload plant photos for AI analysis.
- Surfaces analysis reports, recommendations, and follow-up actions.
- Supports chat, exploration, profiles, and plant detail views.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- State and data: React Router, TanStack Query, Sonner
- Backend: FastAPI, Uvicorn, Python
- Database: Supabase
- AI integrations: Google Gemini, Roboflow, OpenWeather

## Project Structure

- `src/` - frontend application code and pages
- `backend/` - FastAPI server and AI analysis helpers
- `supabase/` - Supabase local configuration

## Backend Python Modules

The backend is split into focused Python scripts:

- `backend/server.py` - FastAPI entry point and API routes
- `backend/analyze_image.py` - plant image analysis with Gemini
- `backend/analyze_agent.py` - AI assistant helper logic
- `backend/detect_disease.py` - disease detection model
- `backend/detect_pest.py` - pest detection model
- `backend/detect_ripeness.py` - ripeness detection model
- `backend/detect_waterStress.py` - water stress detection model
- `backend/growth_tracking.py` - plant growth tracking and report generation
- `backend/weather_integration.py` - weather data integration

These files are part of the project and should stay in sync with the API and README when new analysis flows are added.

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- npm or bun

### Install Frontend Dependencies

```bash
npm install
```

### Run the Frontend

```bash
npm run dev
```

The frontend uses `VITE_API_BASE_URL` when provided. If it is not set, local development assumes the backend is available on the same origin or behind a proxy.

### Install Backend Dependencies

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### Run the Backend

```bash
cd backend
uvicorn server:app --reload --host 127.0.0.1 --port 8010
```

## Environment Variables

Create a `.env` file at the repository root with the values your backend needs. This project expects the `.env` file to exist locally for backend inference and database access.

```env
DB_SUPABASE_SECRET_URL=your_supabase_url
DB_SUPABASE_SECRET_KEY=your_supabase_service_key
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-2.5-flash
ROBOFLOW_API_KEY=your_roboflow_key
OPENWEATHER_API_KEY=your_openweather_key
VITE_API_BASE_URL=http://127.0.0.1:8010
```

Notes:

- The backend also accepts `GEMINI-API-KEY` as an alternative to `GEMINI_API_KEY`.
- `DB_SUPABASE_SECRET_URL` and `DB_SUPABASE_SECRET_KEY` are required for the API routes that read and write Supabase data.
- `GEMINI_API_KEY` is used by the Gemini-based image analysis and growth tracking scripts.
- `ROBOFLOW_API_KEY` is used by the detection model scripts.
- `OPENWEATHER_API_KEY` is used by the weather integration script.
- `VITE_API_BASE_URL` is optional, but useful when the frontend and backend run on different ports.

## API Overview

The backend exposes these main endpoints:

- `GET /` - server status
- `GET /health` - health check
- `GET /api/ai-report/latest` - latest AI report bundle
- `GET /api/ai-report/{report_id}` - report details by ID
- `POST /api/analyze-image` - upload and analyze a plant image
- `GET /api/test-data` and `POST /api/test-data` - Supabase test data helpers

## Frontend Pages

The app includes screens for:

- Home dashboard and care tasks
- Plant list and plant detail views
- Daily check flow
- Image identification and analysis results
- Explore feed, post detail, and creator profiles
- Chat and chat detail views
- User profile and not-found fallback

## Development Scripts

From the repository root:

```bash
npm run dev
npm run build
npm run lint
npm run test
```

## License

No license has been specified yet.

