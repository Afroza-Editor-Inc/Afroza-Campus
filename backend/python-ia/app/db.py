from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Example: using PostgreSQL in production and SQLite for local tests
DATABASE_URL = "postgresql://afroza:afroza@localhost/afroza"
SQLITE_URL = "sqlite:///./test.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
