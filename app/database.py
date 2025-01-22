from sqlalchemy import DateTime, create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Create SQLite database engine
DATABASE_URL = "sqlite:///./test.db"

# SQLAlchemy setup
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class PredictionRecord(Base):
    __tablename__ = 'predictions'
    id = Column(Integer, primary_key=True)
    input_text = Column(String)
    predicted_status = Column(String)

# Create database tables
Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
