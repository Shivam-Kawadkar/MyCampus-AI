# MyCampus — Backend & Database

FastAPI + SQLAlchemy + SQLite backend service for **MyCampus — Your Event Journey**, providing persistent database storage, deterministic scheduling conflict detection, event & task management, timeline feeds, user preferences, and real AI-powered Event Importer capabilities.

---

## 1. Tech Stack
- **Framework:** FastAPI
- **Database:** SQLite (persisted in `backend/mycampus.db`)
- **ORM:** SQLAlchemy 2.x
- **Validation:** Pydantic v2 (with automatic camelCase JSON translation)
- **Image Processing:** Pillow
- **HTTP Client:** httpx
- **Server:** Uvicorn
- **Language:** Python 3.11+

---

## 2. Directory Structure
```
backend/
├── app/
│   ├── main.py              # FastAPI application, CORS, lifespan startup/shutdown
│   ├── database.py          # SQLite engine, SessionLocal, declarative base
│   ├── models.py            # SQLAlchemy models (Events, Tasks, Preferences, Notifications)
│   ├── schemas.py           # Pydantic v2 schemas with camelCase aliasing
│   ├── seed.py              # Automatic seed data for empty databases
│   ├── routers/
│   │   ├── events.py        # Events CRUD, filtering, registration status, conflicts
│   │   ├── tasks.py         # Preparation tasks CRUD & toggle
│   │   ├── dashboard.py     # Aggregated metrics & dashboard summary
│   │   ├── timeline.py      # Unified chronological feed
│   │   ├── preferences.py   # Theme preferences and student profile
│   │   ├── ai.py            # AI Event Importer extraction & status endpoints
│   │   └── notifications.py # Notifications & deadlines
│   └── services/
│       ├── scheduler.py     # Deterministic schedule overlap & conflict detection
│       └── ai_service.py    # Maintainable AI Provider abstraction (Gemini / OpenAI / Fallback)
├── mycampus.db              # SQLite persistent database (created automatically)
├── requirements.txt         # Python package dependencies
├── test_backend.py          # Sanity check test
├── test_api_endpoints.py    # Comprehensive REST endpoint test suite
├── test_ai_importer.py      # AI extraction validation & roundtrip tests
├── test_providers.py        # Provider factory & mock tests
├── test_persistence.py      # Server restart & data persistence test
├── .env.example             # Template environment variables
├── .env                     # Local environment settings
└── README.md
```

---

## 3. Getting Started

### Prerequisites
- Python 3.11+ installed

### Setup & Run
```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment (if not already created)
python -m venv .venv

# 3. Activate virtual environment
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Start the backend development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at:
- **API Base:** `http://127.0.0.1:8000`
- **Swagger UI Docs:** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`
- **Health Check:** `http://127.0.0.1:8000/health`

---

## 4. Real AI Event Importer Configuration

The backend implements a decoupled, maintainable AI provider service (`app/services/ai_service.py`) supporting Google Gemini, OpenAI, and a transparent fallback mode.

### Setting up an AI Provider:
Add your desired provider key to `backend/.env`:

#### Option A: Google Gemini (Recommended for Vision + Text)
```env
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
GEMINI_MODEL="gemini-2.5-flash"
```
- Supports multimodal poster image scanning directly via Gemini Vision.
- Fast, cost-efficient structured extraction.

#### Option B: OpenAI
```env
OPENAI_API_KEY="sk-YourOpenAIApiKeyHere"
OPENAI_MODEL="gpt-4o-mini"
```
- Supports text announcement and flyer vision extraction via Chat Completions.

#### Option C: Unconfigured / Manual Mode (Default)
If neither key is set in `backend/.env`:
- `/api/ai/status` reports `configured: false`.
- The system returns `is_ai_powered: false` and `provider: "none"`.
- It does **NOT** invent fake dates, registration deadlines, or venues.
- It identifies `missing_fields` and prompts the user to review and confirm them manually.

---

## 5. Key Endpoints

### AI Event Importer
- `GET /api/ai/status` — Get active provider status, model name, and supported inputs (`text`, `image`).
- `POST /api/ai/parse-event` — Extract structured event metadata from raw pasted announcement text.
- `POST /api/ai/parse-image` — Extract structured event metadata from poster/flyer image (Data URI or URL, up to 10MB).

### Events
- `GET /api/events` — List events (filters: `category`, `status`, `search`, `limit`, `offset`)
- `GET /api/events/{id}` — Get single event
- `POST /api/events` — Create event (includes date range validation)
- `PUT /api/events/{id}` — Update event
- `PATCH /api/events/{id}/status` — Update registration status (`registered`, `waitlisted`, `not_registered`)
- `DELETE /api/events/{id}` — Delete event
- `GET /api/events/conflicts` — Detect overlapping event schedule conflicts

### Tasks
- `GET /api/tasks` — List prep checklist tasks (filters: `event_id`, `completed`)
- `GET /api/tasks/{id}` — Get single task
- `POST /api/tasks` — Create task
- `PUT /api/tasks/{id}` — Update task
- `POST /api/tasks/{id}/toggle` — Toggle task completion status
- `DELETE /api/tasks/{id}` — Delete task

### Dashboard & Timeline
- `GET /api/dashboard/summary` — Aggregated counts, upcoming registered events, deadlines, weekly tasks, and conflicts
- `GET /api/timeline` — Chronological milestones across events, deadlines, and tasks

### Preferences & Profile
- `GET /api/preferences` — Get theme settings and student profile
- `PUT /api/preferences` — Update theme and profile
- `GET /api/user/profile` — Direct profile access
- `PATCH /api/user/profile` — Update profile

---

## 6. Running Tests

Execute the automated test suites using the virtual environment:
```powershell
# 1. AI Importer Validation & Roundtrip Tests:
.\.venv\Scripts\python.exe test_ai_importer.py

# 2. Provider Unit & Factory Mock Tests:
.\.venv\Scripts\python.exe test_providers.py

# 3. REST API Regression Test Suite:
.\.venv\Scripts\python.exe test_api_endpoints.py

# 4. Durability & SQLite Persistence Across Restart Test:
.\.venv\Scripts\python.exe test_persistence.py
```
