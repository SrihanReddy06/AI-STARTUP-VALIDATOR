import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

# DB path: backend/startup_builder.db
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "startup_builder.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Connect args needed for SQLite threads
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class StartupPlan(Base):
    __tablename__ = "startup_plans"

    id = Column(Integer, primary_key=True, index=True)
    idea = Column(String, nullable=False)
    brand_name = Column(String, nullable=False)
    status = Column(String, default="processing") # "processing", "completed", "failed"
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    report_json = Column(Text, nullable=True) # Serialized JSON string of StartupReport (null during processing)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
