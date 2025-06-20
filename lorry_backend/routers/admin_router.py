from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, Field # Added for AdminPasswordChange

from .. import schemas, models, security, database # Adjusted import paths
from ..models import UserRole # For role checking

router = APIRouter(
    prefix='/api/v1/admin',
    tags=['Admin'],
    dependencies=[Depends(security.get_current_active_user)] # Base dependency for all admin routes
)

# Dependency to check if the user is an admin
async def get_current_admin_user(current_user: models.User = Depends(security.get_current_active_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Not authorized to perform this action')
    return current_user

# --- User Management ---
@router.get(
    '/users',
    response_model=List[schemas.UserInDB],
    dependencies=[Depends(get_current_admin_user)],
    summary="Get All Users (Admin Only)",
    description="Retrieve a list of all users in the system. Requires admin privileges."
)
async def get_all_users(db: Session = Depends(database.get_db), skip: int = 0, limit: int = 100):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.delete('/users/{user_id}', status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin_user)])
async def delete_user_by_admin(user_id: int, current_admin: models.User = Depends(get_current_admin_user), db: Session = Depends(database.get_db)):
    user_to_delete = db.query(models.User).filter(models.User.id == user_id).first()
    if not user_to_delete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'User with id {user_id} not found')

    # Prevent admin from deleting themselves via this generic user deletion endpoint
    if user_to_delete.id == current_admin.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Admin cannot delete self through this endpoint. Use admin management endpoints.')

    db.delete(user_to_delete)
    db.commit()
    return

# --- Load Management (Admin specific) ---
@router.get('/loads', response_model=List[schemas.LoadResponse], dependencies=[Depends(get_current_admin_user)])
async def get_all_loads_admin(db: Session = Depends(database.get_db), skip: int = 0, limit: int = 100):
    loads = db.query(models.Load).order_by(models.Load.posted_date.desc()).offset(skip).limit(limit).all()
    return loads

@router.put('/loads/{load_id}/status', response_model=schemas.LoadResponse, dependencies=[Depends(get_current_admin_user)])
async def update_load_status_admin(load_id: int, status_update: schemas.LoadUpdate, db: Session = Depends(database.get_db)):
    load_to_update = db.query(models.Load).filter(models.Load.id == load_id).first()
    if not load_to_update:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Load with id {load_id} not found')

    if status_update.status is not None: # Check if status is provided in the payload
        load_to_update.status = status_update.status
        db.add(load_to_update)
        db.commit()
        db.refresh(load_to_update)
    return load_to_update

# --- Dispute Management ---
@router.get('/disputes', response_model=List[schemas.DisputeResponse], dependencies=[Depends(get_current_admin_user)])
async def get_all_disputes_admin(db: Session = Depends(database.get_db), skip: int = 0, limit: int = 100):
    disputes = db.query(models.Dispute).order_by(models.Dispute.created_at.desc()).offset(skip).limit(limit).all()
    return disputes

@router.put('/disputes/{dispute_id}/resolve', response_model=schemas.DisputeResponse, dependencies=[Depends(get_current_admin_user)])
async def resolve_dispute_admin(dispute_id: int, resolution_data: schemas.DisputeUpdate, db: Session = Depends(database.get_db)):
    dispute_to_update = db.query(models.Dispute).filter(models.Dispute.id == dispute_id).first()
    if not dispute_to_update:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Dispute with id {dispute_id} not found')

    if resolution_data.resolution_details is not None:
        dispute_to_update.resolution_details = resolution_data.resolution_details
    if resolution_data.status is not None:
        dispute_to_update.status = resolution_data.status
    else:
        dispute_to_update.status = 'resolved' # Default to resolved if status not explicitly provided and details are

    db.add(dispute_to_update)
    db.commit()
    db.refresh(dispute_to_update)
    return dispute_to_update

# --- Admin User Management (managing other admins) ---
@router.post('/admins', response_model=schemas.UserInDB, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_admin_user)])
async def create_new_admin(admin_data: schemas.UserCreate, db: Session = Depends(database.get_db)):
    existing_user = db.query(models.User).filter(
        (models.User.email == admin_data.email) | (models.User.username == admin_data.username)
    ).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Username or email already exists')

    # Ensure the role being assigned is actually ADMIN, even though UserCreate allows any role.
    if admin_data.role != UserRole.ADMIN:
        # Or, just override it: admin_data.role = UserRole.ADMIN
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role must be ADMIN for this endpoint")


    hashed_password = security.get_password_hash(admin_data.password)
    db_admin = models.User(
        username=admin_data.username,
        email=admin_data.email,
        hashed_password=hashed_password,
        role=UserRole.ADMIN # Explicitly set role to ADMIN
    )
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin

@router.get('/admins', response_model=List[schemas.UserInDB], dependencies=[Depends(get_current_admin_user)])
async def get_all_admins(db: Session = Depends(database.get_db)):
    admins = db.query(models.User).filter(models.User.role == UserRole.ADMIN).all()
    return admins

@router.delete('/admins/{admin_id_to_delete}', status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin_user)])
async def delete_admin_by_admin(admin_id_to_delete: int, current_admin: models.User = Depends(get_current_admin_user), db: Session = Depends(database.get_db)):
    if admin_id_to_delete == current_admin.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Cannot delete yourself')

    admin_to_delete = db.query(models.User).filter(models.User.id == admin_id_to_delete, models.User.role == UserRole.ADMIN).first()
    if not admin_to_delete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Admin with id {admin_id_to_delete} not found')

    db.delete(admin_to_delete)
    db.commit()
    return

@router.get('/admins/{admin_id}/profile', response_model=schemas.UserInDB, dependencies=[Depends(get_current_admin_user)])
async def get_admin_profile(admin_id: int, db: Session = Depends(database.get_db)):
    admin_user = db.query(models.User).filter(models.User.id == admin_id, models.User.role == UserRole.ADMIN).first()
    if not admin_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Admin with id {admin_id} not found')
    return admin_user

# Define AdminPasswordChange schema here or import from schemas if moved
class AdminPasswordChange(BaseModel):
    new_password: str = Field(..., min_length=6)

@router.put('/admins/{admin_id}/profile', response_model=schemas.UserInDB, dependencies=[Depends(get_current_admin_user)])
async def update_admin_profile(admin_id: int, profile_data: schemas.UserCreate, db: Session = Depends(database.get_db)):
    admin_user = db.query(models.User).filter(models.User.id == admin_id, models.User.role == UserRole.ADMIN).first()
    if not admin_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Admin with id {admin_id} not found')

    if profile_data.username and profile_data.username != admin_user.username:
        existing = db.query(models.User).filter(models.User.username == profile_data.username).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Username already taken')
        admin_user.username = profile_data.username

    if profile_data.email and profile_data.email != admin_user.email:
        existing = db.query(models.User).filter(models.User.email == profile_data.email).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Email already registered')
        admin_user.email = profile_data.email

    if profile_data.password:
        admin_user.hashed_password = security.get_password_hash(profile_data.password)

    # Ensure role remains ADMIN if it's part of UserCreate and could be changed
    admin_user.role = UserRole.ADMIN

    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    return admin_user

@router.put('/admins/{admin_id}/password', status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin_user)])
async def change_admin_password_by_admin(admin_id: int, password_data: AdminPasswordChange, db: Session = Depends(database.get_db)):
    admin_to_update = db.query(models.User).filter(models.User.id == admin_id, models.User.role == UserRole.ADMIN).first()
    if not admin_to_update:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Admin with id {admin_id} not found')

    admin_to_update.hashed_password = security.get_password_hash(password_data.new_password)
    db.add(admin_to_update)
    db.commit()
    return
