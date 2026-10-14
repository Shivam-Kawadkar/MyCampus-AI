import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .database import init_db, SessionLocal
from .seed import seed_database_if_empty
from .routers import (
    auth,
    events,
    tasks,
    dashboard,
    timeline,
    preferences,
    ai,
    notifications,
)

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager that handles startup initialization
    and clean shutdown for FastAPI.
    """
    # 1. Initialize SQLite tables if not already created
    init_db()

    # 2. Seed initial data if tables are empty
    db = SessionLocal()
    try:
        seed_database_if_empty(db)
    finally:
        db.close()

    yield

app = FastAPI(
    title=os.getenv("PROJECT_NAME", "MyCampus API"),
    description="Backend API and Database for MyCampus — Your Event Journey",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
cors_origins_raw = os.getenv("CORS_ORIGINS", "")
parsed_origins = [
    origin.strip().strip('"\'')
    for origin in cors_origins_raw.split(",")
    if origin.strip().strip('"\'')
]
all_origins = list(set(default_origins + parsed_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=all_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)
app.include_router(timeline.router)
app.include_router(preferences.router)
app.include_router(ai.router)
app.include_router(notifications.router)

@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify backend status."""
    return {
        "status": "ok",
        "app": "MyCampus API",
        "version": "1.0.0",
        "database": "sqlite",
    }

@app.get("/", tags=["Root"])
def root():
    """Root metadata with link to API documentation."""
    return {
        "message": "Welcome to MyCampus API",
        "docs_url": "/docs",
        "health_url": "/health",
    }
