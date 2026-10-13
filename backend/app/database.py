import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Load environment variables
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mycampus.db")

# For SQLite, check if relative path and anchor to backend root
if DATABASE_URL.startswith("sqlite:///./"):
    db_filename = DATABASE_URL.replace("sqlite:///./", "")
    db_path = BASE_DIR / db_filename
    DATABASE_URL = f"sqlite:///{db_path}"

# SQLite specific connect args
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency that yields an active database session and ensures clean closure."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initializes database tables without dropping existing data, ensuring user_id columns exist."""
    Base.metadata.create_all(bind=engine)

    # SQLite dynamic column migration check for tables created prior to multi-user support
    with engine.connect() as conn:
        for table in ["events", "tasks", "notifications"]:
            try:
                res = conn.exec_driver_sql(f"PRAGMA table_info({table})").fetchall()
                cols = [r[1] for r in res]
                if cols and "user_id" not in cols:
                    conn.exec_driver_sql(f"ALTER TABLE {table} ADD COLUMN user_id VARCHAR(64) NOT NULL DEFAULT 'demo_user_1'")
                    conn.exec_driver_sql(f"CREATE INDEX IF NOT EXISTS ix_{table}_user_id ON {table} (user_id)")
                    conn.commit()
            except Exception:
                pass

