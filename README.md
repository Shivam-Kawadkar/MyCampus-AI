# MyCampus — Your Event Journey 🎓⚡

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> **Every Campus Event. One Smart Place.**  
> Transform messy WhatsApp announcements, Instagram flyers, and disparate campus posters into a unified, actionable personal event journey.

---

## 🌟 Overview

**MyCampus** is a full-stack collegiate event management platform designed to solve the chaos of campus life. Built with a modern dark SaaS aesthetic accented with electric lime, MyCampus empowers students to discover campus events, import promotional graphics using multimodal Google Gemini AI, track chronological deadlines, and prepare with context-aware checklists.

A dedicated **Judge Demo Authentication System** provides three distinct, isolated user personas with realistic collegiate datasets and 1-click credential autofill.

---

## 🚀 Key Features

### 1. 🤖 Multimodal AI Event Importer
- **Flyer OCR & Vision Extraction:** Drag and drop promotional graphics, posters, or screenshots. Google Gemini Vision extracts title, date, time, venue, description, and suggested prep tasks with zero fabrications.
- **Text Announcement Parsing:** Paste unstructured WhatsApp club broadcasts or email newsletters to generate structured event objects.
- **Honest Warning Engine:** Never hallucinates missing information. Highlights uncertain dates or missing room numbers with clear flags for manual review.

### 2. 📅 Campus Event Discovery
- Filter events across **Hackathons**, **Tech Talks**, **Workshops**, **Cultural**, **Career Fairs**, **Sports**, and **Academic** categories.
- Real-time keyword search, venue filtering, and RSVP status tracking (`Registered`, `Waitlisted`, `Not Registered`).

### 3. ⏳ Personal Event Timeline
- Synchronized chronological feed integrating event dates, registration cutoff deadlines, and preparation milestones.
- Clear visual overlap detection alerts you to schedule conflicts before you commit.

### 4. ✅ Actionable Preparation Checklists
- Context-aware checklist generator automatically proposes prep tasks (e.g., *"Print copies of resume"*, *"Bring Ethernet dongle"*, *"Register team on Devpost"*).
- Priority tagging (`High`, `Medium`, `Low`) and persistent state tracking.

### 5. 🎨 4-Theme Dynamic Styling Engine
- Switch seamlessly between 4 harmonious palettes:
  - **Midnight Pulse** (Dark Charcoal + Electric Lime `#C6FF3D`)
  - **Clean Light** (Warm Off-White + Forest Green `#1E5E2E`)
  - **Graphite Ember** (Deep Graphite + Ember Orange `#FF6B35`)
  - **Warm Sand** (Stone Beige + Terracotta `#B34B28`)
- Instant switching via the navigation bar theme dropdown with high-contrast accessibility.

### 6. 🔒 Collegiate Judge Demo Environment
- Dedicated demo login page (`/login`) designed specifically for evaluation.
- Three pre-configured demo personas with completely isolated SQLite datasets.
- 1-click credential autofill without auto-submitting the form.
- Top-bar *"Reset Demo Data"* action to restore clean sample records anytime.

---

## 👥 Preset Demo Accounts for Evaluation

All demo accounts share the password: `demo123`

| Account | Email | Password | Persona & Fictional Dataset |
| :--- | :--- | :--- | :--- |
| **Demo User 1** | `demo1@mycampus.demo` | `demo123` | **Campus Explorer** — Attending national hackathons (HackNova 2026), career showcases, and robotics expos. Rich personal timeline and prep tasks. |
| **Demo User 2** | `demo2@mycampus.demo` | `demo123` | **Event Organizer** — Managing collegiate DevSprints, auditorium AV logistics, catering contracts, and volunteer schedules. |
| **Demo User 3** | `demo3@mycampus.demo` | `demo123` | **AI Feature Tester** — Sample events imported from flyer scans and text announcements with calibrated confidence scores. |

---

## 🏗️ Architecture & Project Structure

```
MyCampus/
├── .gitignore
├── .env.example              # Frontend environment template
├── package.json              # React + Vite dependencies
├── tailwind.config.js        # Tailwind design tokens
├── vite.config.ts            # Vite configuration
│
├── src/                      # Frontend Application (React 18 + TypeScript)
│   ├── components/
│   │   ├── common/           # Brand Logo, ThemeToggle, Badge, Modal, Toast
│   │   ├── events/           # EventCard, EventDetailModal, AddEventModal
│   │   ├── layout/           # Header, Sidebar, MobileNav
│   │   └── tasks/            # TaskItem, AddTaskModal
│   ├── context/
│   │   ├── AuthContext.tsx   # Demo authentication & session management
│   │   ├── EventContext.tsx  # Events, tasks, and notifications state
│   │   └── ThemeContext.tsx  # Dynamic 4-theme styling system
│   ├── pages/
│   │   ├── LandingPage.tsx   # Public SaaS landing page (/)
│   │   ├── LoginPage.tsx     # Demo login page with autofill (/login)
│   │   ├── Dashboard.tsx     # Command center overview
│   │   ├── MyEvents.tsx      # Registered & saved events
│   │   ├── Timeline.tsx      # Chronological agenda feed
│   │   ├── AIImporter.tsx    # Gemini multimodal flyer & text importer
│   │   ├── DiscoverEvents.tsx# Campus catalog & search
│   │   └── Settings.tsx      # Student profile & theme preferences
│   └── lib/
│       ├── api.ts            # Typed REST client with bearer token injection
│       └── utils.ts          # Tailwind merge utilities
│
└── backend/                  # Backend Application (FastAPI + SQLite)
    ├── .env.example          # Backend environment template
    ├── requirements.txt      # Python dependencies
    ├── app/
    │   ├── main.py           # FastAPI application & router mounting
    │   ├── database.py       # SQLite engine & automatic column migrations
    │   ├── models.py         # SQLAlchemy ORM models (Events, Tasks, Notifications)
    │   ├── schemas.py        # Pydantic v2 schemas with camelCase aliasing
    │   ├── auth.py           # HMAC-SHA256 demo JWT tokens & auth guards
    │   ├── seed.py           # Isolated fictional datasets for Demo 1, 2, 3
    │   ├── routers/
    │   │   ├── auth.py       # /api/auth demo login & reset endpoints
    │   │   ├── events.py     # Events CRUD & schedule overlap detection
    │   │   ├── tasks.py      # Preparation tasks management
    │   │   ├── dashboard.py  # Aggregated metrics & counts
    │   │   ├── timeline.py   # Chronological milestones
    │   │   ├── notifications.py # Real-time alerts
    │   │   ├── preferences.py# Student profile settings
    │   │   └── ai.py         # Gemini flyer OCR & text extraction
    │   └── services/
    │       ├── ai_service.py # Google Gemini & OpenAI provider adapters
    │       └── scheduler.py  # Deterministic calendar conflict detection
    └── test_*.py             # Automated regression & integration test suites
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js:** v18.0+
- **Python:** v3.11+
- **Git**

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Shivam-Kawadkar/MyCampus-AI.git
cd MyCampus-AI
```

---

### Step 2: Backend Setup (FastAPI + SQLite)

```powershell
# 1. Navigate to backend directory
cd backend

# 2. Create and activate Python virtual environment
python -m venv .venv

# On Windows:
.\.venv\Scripts\Activate.ps1
# On macOS/Linux:
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create your backend environment configuration
cp .env.example .env
```

#### Configure `backend/.env`:
```ini
PROJECT_NAME="MyCampus API"
DATABASE_URL="sqlite:///./mycampus.db"
CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
HOST="127.0.0.1"
PORT=8000

# Google Gemini API Key (Required for AI Event Importer)
GEMINI_API_KEY="your-google-ai-studio-api-key"
GEMINI_MODEL="gemini-2.5-flash"

# Demo Session Signing Secret
DEMO_JWT_SECRET="mycampus_demo_secret_2026_collegiate_judges_evaluation"
```

> [!TIP]
> You can obtain a free Gemini API key at [Google AI Studio](https://aistudio.google.com/). If omitted, the app runs in manual review mode.

#### 5. Launch the FastAPI server:
```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **API Base:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`

---

### Step 3: Frontend Setup (React + Vite)

In a new terminal window:
```powershell
# 1. From the project root
cd MyCampus

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev -- --host 127.0.0.1 --port 5173
```
- Open `http://127.0.0.1:5173/` in your browser.

---

## 🧪 Automated Testing

All features are covered by automated test suites in the `backend/` directory:

```powershell
cd backend

# 1. Demo Authentication, JWT, and Data Isolation Tests
.\.venv\Scripts\python.exe test_demo_auth.py

# 2. Real Gemini AI Text & Image Extraction Tests
.\.venv\Scripts\python.exe test_ai_importer.py

# 3. REST API Integration Tests
.\.venv\Scripts\python.exe test_api_endpoints.py

# 4. SQLite Persistence & Durability Across Restarts
.\.venv\Scripts\python.exe test_persistence.py

# 5. AI Provider Factory Tests
.\.venv\Scripts\python.exe test_providers.py
```

### Production Build Verification
```powershell
npm run build
```

---

## 🛡️ Security & Privacy Notice

- **Demo Evaluation Scope:** The authentication system uses HMAC-SHA256 session tokens specifically engineered for local judging and portfolio demonstrations.
- **Fictional Data Only:** All sample events, organizers, and campus profiles are purely fictional. No private student data is collected or transmitted.
- **Secret Protection:** API keys and cryptographic signing secrets are stored exclusively in backend environment variables and are never exposed in frontend code, public API payloads, or client bundles.

---

## 📜 License

This project was developed for collegiate software judging and demonstration. Distributed under the MIT License.
