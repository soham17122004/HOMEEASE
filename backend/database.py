"""
Database Connection & Session Configuration
Supports PostgreSQL via DATABASE_URL environment variable,
with fallback to local SQLite for seamless offline/standalone operation.
"""

import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker

# PostgreSQL connection string: e.g. postgresql://user:password@localhost:5432/homeease
# Or default to local SQLite database if PostgreSQL is not specified
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Use SQLite file in the backend directory
    db_path = os.path.join(os.path.dirname(__file__), "homeease.db")
    DATABASE_URL = f"sqlite:///{db_path}"

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

# Enable WAL mode and busy timeout for SQLite to handle concurrent readers/writers gracefully
if DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragmas(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")   # WAL: readers don't block writers
        cursor.execute("PRAGMA busy_timeout=5000")   # 5 s wait before "database is locked"
        cursor.close()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency that yields a database session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
