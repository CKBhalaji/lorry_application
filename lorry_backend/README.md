# Lorry Application Backend

This is the FastAPI backend for the Lorry logistics platform.

## Features
- User authentication (JWT-based)
- Role-based access (Admin, Driver, Goods Owner)
- Load, bid, and dispute management
- RESTful API endpoints for all core features
- SQLite database (default, can be swapped for PostgreSQL/MySQL)

## Folder Structure
```
lorry_backend/
├── main.py            # FastAPI entry point
├── models.py          # SQLAlchemy ORM models
├── schemas.py         # Pydantic schemas
├── routers/           # API route modules (driver, owner, admin, etc.)
├── database.py        # Database connection
├── utils.py           # Utility functions
├── requirements.txt   # Python dependencies
└── ...
```

## How to Run
```sh
cd lorry_backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
uvicorn main:app --reload
```
- The API will run at `http://localhost:8000`.

## Key Files
- `main.py` — FastAPI app and router registration
- `models.py` — SQLAlchemy models for all tables
- `schemas.py` — Pydantic schemas for request/response validation
- `routers/` — Route handlers for drivers, owners, admin, etc.
- `database.py` — Database session and engine

## Database
- Default: SQLite (`LorryDatabase.db` in project root)
- You can use [DB Browser for SQLite](https://sqlitebrowser.org/) to inspect the database.
- To switch to PostgreSQL/MySQL, update `database.py` accordingly.

## API Docs
- Interactive docs available at `http://localhost:8000/docs` (Swagger UI)

## Contribution
- Follow FastAPI and Pydantic best practices.
- Use routers for modular API structure.
- Add/modify endpoints in the appropriate router file in `routers/`.
