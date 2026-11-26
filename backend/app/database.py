import os
from typing import Optional
from datetime import datetime
from sqlalchemy import create_engine, Integer, String, Text, DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

# DB path: backend/startup_builder.db with fallback to /tmp on serverless environments
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if os.getenv("DATABASE_PATH"):
    DB_PATH = os.getenv("DATABASE_PATH")
elif os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
    DB_PATH = "/tmp/startup_builder.db"
else:
    DB_PATH = os.path.join(BASE_DIR, "startup_builder.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Connect args needed for SQLite threads
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

class StartupPlan(Base):
    __tablename__ = "startup_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    idea: Mapped[str] = mapped_column(String, nullable=False)
    brand_name: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, default="processing")  # "processing", "completed", "failed"
    error_message: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    report_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Serialized JSON string of StartupReport

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
