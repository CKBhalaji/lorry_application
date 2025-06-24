from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, Field # Added for AdminPasswordChange

from .. import schemas, models, security, database # Adjusted import paths
from ..models import UserRole # For role checking

router = APIRouter(
    prefix='/api/admin',
    tags=['Admin'],
    dependencies=[Depends(security.get_current_active_user)] # Base dependency for all admin routes
)

# --- Admin Signup (Open) ---
from fastapi import Body
@router.post('/admins/signup', response_model=schemas.UserInDB, status_code=status.HTTP_201_CREATED, dependencies=[])
async def signup_admin(admin_data: schemas.UserCreate = Body(...), db: Session = Depends(database.get_db)):
    existing_user = db.query(models.User).filter(
        (models.User.email == admin_data.email) | (models.User.username == admin_data.username)
    ).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Username or email already exists')
    hashed_password = security.get_password_hash(admin_data.password)
    db_admin = models.User(
        username=admin_data.username,
        email=admin_data.email,
        hashed_password=hashed_password,
        role=UserRole.ADMIN
    )
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin

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
@router.get('/disputes', response_model=List[schemas.AdminDisputeResponse], dependencies=[Depends(get_current_admin_user)])
async def get_all_disputes_admin(db: Session = Depends(database.get_db), skip: int = 0, limit: int = 100):
    disputes = db.query(models.Dispute).order_by(models.Dispute.created_at.desc()).offset(skip).limit(limit).all()
    admin_disputes = []
    for dispute in disputes:
        # Get driver details
        driver = db.query(models.User).filter(models.User.id == dispute.driverId).first() if dispute.driverId else None
        driver_profile = db.query(models.DriverProfile).filter(models.DriverProfile.user_id == dispute.driverId).first() if dispute.driverId else None
        # Get load and owner details
        load = db.query(models.Load).filter(models.Load.id == dispute.loadId).first() if dispute.loadId else None
        owner = db.query(models.User).filter(models.User.id == load.owner_id).first() if load and load.owner_id else None
        owner_profile = db.query(models.GoodsOwnerProfile).filter(models.GoodsOwnerProfile.user_id == load.owner_id).first() if load and load.owner_id else None
        admin_disputes.append({
            'id': dispute.id,
            'loadId': dispute.loadId,
            'driverId': dispute.driverId,
            'ownerId': load.owner_id if load else None,
            'driver_name': driver.username if driver else '',
            'driver_email': driver.email if driver else '',
            'driver_phone': driver_profile.phone_number if driver_profile else '',
            'owner_name': owner.username if owner else '',
            'owner_email': owner.email if owner else '',
            'owner_phone': owner_profile.phone_number if owner_profile else '',
            'disputeType': dispute.disputeType,
            'created_at': dispute.created_at,
            'message': dispute.message,
            'status': dispute.status,
            'resolution_details': dispute.resolution_details,
        })
    return admin_disputes

@router.put('/disputes/{dispute_id}/resolve', response_model=schemas.DisputeResponse, dependencies=[Depends(get_current_admin_user)])
async def resolve_dispute_admin(dispute_id: int, resolution_data: schemas.DisputeUpdate, db: Session = Depends(database.get_db)):
    dispute_to_update = db.query(models.Dispute).filter(models.Dispute.id == dispute_id).first()
    if not dispute_to_update:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Dispute with id {dispute_id} not found')

    if resolution_data.resolution_details is not None:
        dispute_to_update.resolution_details = resolution_data.resolution_details
    # If status is provided, use it. Otherwise, infer from resolution_details.
    if resolution_data.status is not None:
        dispute_to_update.status = resolution_data.status
    elif resolution_data.resolution_details and 'reject' in resolution_data.resolution_details.lower():
        dispute_to_update.status = 'rejected'
    else:
        dispute_to_update.status = 'resolved' # Default to resolved if status not explicitly provided and details are

    print(f"DEBUG: Dispute {dispute_id} status set to {dispute_to_update.status}")
    db.add(dispute_to_update)
    db.commit()
    db.refresh(dispute_to_update)
    return dispute_to_update

# --- Admin User Management (managing other admins) ---
@router.post('/admins', response_model=schemas.UserInDB, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_admin_user)])
async def create_new_admin(admin_data: schemas.AdminUserCreate, db: Session = Depends(database.get_db)):
    existing_user = db.query(models.User).filter(
        (models.User.email == admin_data.email) | (models.User.username == admin_data.username)
    ).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Username or email already exists')

    # Ensure the role being assigned is actually ADMIN, even though UserCreate allows any role.
    if admin_data.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role must be ADMIN for this endpoint")

    hashed_password = security.get_password_hash(admin_data.password)
    db_admin = models.User(
        username=admin_data.username,
        email=admin_data.email,
        hashed_password=hashed_password,
        role=UserRole.ADMIN
    )
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    # Create admin profile (requires 'name' in admin_data)
    if hasattr(admin_data, 'name') and admin_data.name:
        phone_number = getattr(admin_data, 'phone_number', '') or getattr(admin_data, 'phone', '') or ''
        admin_profile = models.AdminProfile(user_id=db_admin.id, name=admin_data.name, phone_number=phone_number)
        db.add(admin_profile)
        db.commit()
        db.refresh(admin_profile)
    return db_admin

@router.get('/admins', response_model=List[schemas.UserInDB], dependencies=[Depends(get_current_admin_user)])
async def get_all_admins(db: Session = Depends(database.get_db)):
    admins = db.query(models.User).filter(models.User.role == UserRole.ADMIN).all()
    result = []
    for admin in admins:
        profile = db.query(models.AdminProfile).filter(models.AdminProfile.user_id == admin.id).first()
        admin_dict = admin.__dict__.copy()
        admin_dict['name'] = profile.name if profile else ''
        result.append(admin_dict)
    return result

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

@router.get('/admins/{admin_id}/profile', response_model=schemas.AdminProfileFullResponse, dependencies=[Depends(get_current_admin_user)])
async def get_admin_profile(admin_id: int, db: Session = Depends(database.get_db)):
    admin_user = db.query(models.User).filter(models.User.id == admin_id, models.User.role == UserRole.ADMIN).first()
    if not admin_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Admin with id {admin_id} not found')
    profile = db.query(models.AdminProfile).filter(models.AdminProfile.user_id == admin_id).first()
    admin_dict = admin_user.__dict__.copy()
    # print(f"DEBUG: Found admin profile for user_id={admin_id}: {profile}")
    if profile:
        # print(f"DEBUG: Merging name={profile.name}, phone_number={profile.phone_number}")
        admin_dict['name'] = profile.name
        admin_dict['phone_number'] = profile.phone_number
    # else:
        # print(f"DEBUG: No admin profile found for user_id={admin_id}")
    # Remove SQLAlchemy state and convert role to string
    admin_dict.pop('_sa_instance_state', None)
    if isinstance(admin_dict.get('role'), str):
        pass
    else:
        admin_dict['role'] = str(admin_dict['role']) if admin_dict.get('role') else ''
    # print(f"DEBUG: Returning admin_dict: {admin_dict}")
    return admin_dict

# Define AdminPasswordChange schema here or import from schemas if moved
class AdminPasswordChange(BaseModel):
    old_password: str
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

# --- AdminProfile update only (name, phone_number) ---
@router.put('/admins/{admin_id}/admin_profile', response_model=schemas.AdminProfileResponse, dependencies=[Depends(get_current_admin_user)])
async def update_admin_profile_only(admin_id: int, profile_data: schemas.AdminProfileCreate, db: Session = Depends(database.get_db)):
    profile = db.query(models.AdminProfile).filter(models.AdminProfile.user_id == admin_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail='Admin profile not found.')
    profile.name = profile_data.name
    profile.phone_number = profile_data.phone_number
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

@router.put('/admins/{admin_id}/password', status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin_user)])
async def change_admin_password_by_admin(admin_id: int, password_data: AdminPasswordChange, db: Session = Depends(database.get_db)):
    admin_to_update = db.query(models.User).filter(models.User.id == admin_id, models.User.role == UserRole.ADMIN).first()
    if not admin_to_update:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Admin with id {admin_id} not found')
    # Verify old password
    if not security.verify_password(password_data.old_password, admin_to_update.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Old password is incorrect.')
    admin_to_update.hashed_password = security.get_password_hash(password_data.new_password)
    db.add(admin_to_update)
    db.commit()
    return
