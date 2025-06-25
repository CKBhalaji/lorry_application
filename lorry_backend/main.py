from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base 
from .routers import auth_router, admin_router, driver_router, goods_owner_router
from .config import settings # For upload directory or other settings if needed

# Create all database tables if they don't exist
# This is suitable for development. For production, use migrations (e.g., Alembic).
Base.metadata.create_all(bind=engine)

# Create superadmin if not exists
from . import models, security, database
from sqlalchemy.orm import Session

def create_superadmin_if_not_exists():
    db: Session = next(database.get_db())
    existing = db.query(models.User).filter(models.User.username == 'superadmin').first()
    if not existing:
        hashed_password = security.get_password_hash('admin@123')  # Change to a secure password!
        superadmin = models.User(
            username='superadmin',
            email='superadmin@example.com',
            hashed_password=hashed_password,
            role=models.UserRole.SUPERADMIN.value,
            is_active=True
        )
        db.add(superadmin)
        db.commit()
        db.refresh(superadmin)
        print("Superadmin created:", superadmin)
    else:
        print("Superadmin already exists")

create_superadmin_if_not_exists()

app = FastAPI(
    title="Lorry Backend API",
    description="API for Lorry Transportation Service, managing users (admins, drivers, goods owners), loads, bids, and disputes.",
    version="0.1.0"
)

# CORS Configuration
# Adjust origins as necessary. "*" is permissive for development.
# For production, list specific frontend origins.
origins = [
    "http://localhost",         # Common base for local development
    "http://localhost:5173",    # Default Vite dev server port
    "http://localhost:3000",    # Common React dev server port (if applicable)
    # Add your deployed frontend URL here for production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(auth_router.router)
app.include_router(admin_router.router)
app.include_router(driver_router.router)
app.include_router(goods_owner_router.router)

@app.get('/')
async def root():
    return {'message': 'Lorry backend is running and accessible'}

# (Optional) Add static file serving if profile pictures/docs are stored locally and need to be served
# from fastapi.staticfiles import StaticFiles
# import os
# if not os.path.exists(settings.UPLOAD_DIRECTORY):
#     os.makedirs(settings.UPLOAD_DIRECTORY)
# app.mount(f"/{settings.UPLOAD_DIRECTORY}", StaticFiles(directory=settings.UPLOAD_DIRECTORY), name="uploads")
