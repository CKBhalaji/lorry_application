# Lorry Application

A full-stack logistics platform for connecting drivers and goods owners, managing loads, bids, disputes, and more.

## Features
- User registration and login for Drivers, Goods Owners, and Admins
- Dashboard for each user type
- Load posting and bidding system
- Dispute management for both drivers and goods owners
- Admin management and analytics
- Responsive, modern UI with light/dark theme support

## Tech Stack
- **Frontend:** React (with React Router), CSS Modules
- **Backend:** FastAPI (Python), Pydantic v2
- **Database:** SQLite (default, can be swapped for PostgreSQL/MySQL)

## Project Structure
```
lorry_application/
├── lorry_backend/      # FastAPI backend
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── routers/
│   └── ...
├── lorry_frontend/     # React frontend
│   ├── src/
│   │   ├── Pages/
│   │   ├── components/
│   │   └── ...
��   └── ...
├── LorryDatabase.db    # SQLite database
└── README.md
```

## Setup Instructions

### 1. Backend (FastAPI)
```sh
cd lorry_backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
uvicorn main:app --reload
```
- The API will be available at `http://localhost:8000`.

### 2. Frontend (React)
```sh
cd lorry_frontend
npm install
npm start
```
- The app will be available at `http://localhost:5173`.

### 3. Database (SQLite)
- The default database is `LorryDatabase.db` in the project root.
- You can browse/edit it with [DB Browser for SQLite](https://sqlitebrowser.org/) or the `sqlite3` CLI.

## Usage
- Visit the home page and register as a Driver or Goods Owner.
- Admins can log in via the Admin Login button.
- Use the dashboard to manage loads, bids, and disputes.

## Development
- All environment variables are in `.env` files in each app.
- Backend code is in `lorry_backend/`, frontend in `lorry_frontend/`.
- Use `uvicorn` for backend dev, `npm start` for frontend dev.

## Contribution
Pull requests are welcome! Please open an issue first to discuss major changes.

