from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, models, security, database
from ..models import UserRole # For role checking

router = APIRouter(
    prefix='/api/v1/owners', # Aligning with frontend /api/owners path structure
    tags=['Goods Owners'],
    dependencies=[Depends(security.get_current_active_user)]
)

# Dependency to check if the user is a goods_owner
async def get_current_goods_owner_user(current_user: models.User = Depends(security.get_current_active_user)):
    if current_user.role != UserRole.GOODS_OWNER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='User is not a goods owner')
    if not current_user.goods_owner_profile: # Ensure goods owner profile exists
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Goods owner profile not found for user')
    return current_user

# --- Load functionalities for Goods Owners ---
@router.post('/loads', response_model=schemas.LoadResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_goods_owner_user)])
async def post_new_load_by_owner(load_data: schemas.LoadCreate, current_owner: models.User = Depends(get_current_goods_owner_user), db: Session = Depends(database.get_db)):
    db_load = models.Load(
        **(load_data.model_dump() if hasattr(load_data, 'model_dump') else load_data.dict()), # Pydantic v1/v2 compat
        owner_id=current_owner.id,
        status='pending' # Initial status
    )
    db.add(db_load)
    db.commit()
    db.refresh(db_load)
    return db_load

@router.get('/loads', response_model=List[schemas.LoadResponse], dependencies=[Depends(get_current_goods_owner_user)])
async def get_owner_loads(current_owner: models.User = Depends(get_current_goods_owner_user), db: Session = Depends(database.get_db), skip: int = 0, limit: int = 100):
    loads = db.query(models.Load).filter(models.Load.owner_id == current_owner.id).order_by(models.Load.posted_date.desc()).offset(skip).limit(limit).all()
    return loads

# --- Goods Owner Profile Management ---
# GET /api/owners/{owner_id}/profile
@router.get('/{owner_id}/profile', response_model=schemas.GoodsOwnerProfileResponse) # Auth via main dependency
async def get_goods_owner_profile(owner_id: int, current_user: models.User = Depends(security.get_current_active_user), db: Session = Depends(database.get_db)):
    # Permission check: User must be the goods owner themselves or an admin
    if current_user.role != UserRole.ADMIN and owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Not authorized to view this profile.')

    # If the requester is not an admin, they must be the goods owner making the request for their own profile
    if current_user.role != UserRole.ADMIN and owner_id == current_user.id and current_user.role != UserRole.GOODS_OWNER:
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='User is not a goods owner.')


    profile = db.query(models.GoodsOwnerProfile).join(models.User).filter(models.GoodsOwnerProfile.user_id == owner_id, models.User.role == UserRole.GOODS_OWNER).first()

    if not profile:
        # Check if the user exists and is a goods owner but just lacks a profile entry
        user_exists = db.query(models.User).filter(models.User.id == owner_id, models.User.role == UserRole.GOODS_OWNER).first()
        if user_exists:
             # This case might mean the profile was not created during signup, or an error occurred.
             # Depending on policy, could return 404 or a default/empty profile.
             # For now, consistent 404 if profile table entry is missing.
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Goods owner profile data not found for this user.')
        else:
            # User is not a goods owner or does not exist
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Goods owner not found or user is not a goods owner.')
    return profile

# PUT /api/owners/{owner_id}/profile - Assuming this means updating GoodsOwnerProfile model
@router.put('/{owner_id}/profile', response_model=schemas.GoodsOwnerProfileResponse, dependencies=[Depends(get_current_goods_owner_user)])
async def update_goods_owner_profile(owner_id: int, profile_data: schemas.GoodsOwnerProfileUpdate, current_owner: models.User = Depends(get_current_goods_owner_user), db: Session = Depends(database.get_db)):
    if owner_id != current_owner.id: # Redundant due to get_current_goods_owner_user but for clarity
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='You can only update your own profile.')

    db_profile = db.query(models.GoodsOwnerProfile).filter(models.GoodsOwnerProfile.user_id == owner_id).first()
    if not db_profile: # Should be caught by get_current_goods_owner_user
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Goods owner profile not found.')

    update_data = profile_data.model_dump(exclude_unset=True) if hasattr(profile_data, 'model_dump') else profile_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_profile, key, value)

    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

# --- Goods Owner Dispute Management ---
# POST /api/owner/disputes (Frontend path) -> Our router prefix is /api/v1/owners
@router.post('/disputes', response_model=schemas.DisputeResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_goods_owner_user)])
async def create_owner_dispute(dispute_data: schemas.DisputeCreate, current_owner: models.User = Depends(get_current_goods_owner_user), db: Session = Depends(database.get_db)):
    if dispute_data.related_load_id:
        load = db.query(models.Load).filter(models.Load.id == dispute_data.related_load_id).first()
        if not load:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Related load with id {dispute_data.related_load_id} not found.')
        if load.owner_id != current_owner.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Cannot raise dispute for a load not owned by you.')

    db_dispute = models.Dispute(
        reported_by_user_id=current_owner.id,
        related_load_id=dispute_data.related_load_id,
        dispute_reason=dispute_data.dispute_reason,
        status='open'
    )
    db.add(db_dispute)
    db.commit()
    db.refresh(db_dispute)
    return db_dispute

# GET /api/owner/disputes (Frontend path)
@router.get('/disputes', response_model=List[schemas.DisputeResponse], dependencies=[Depends(get_current_goods_owner_user)])
async def get_owner_disputes(current_owner: models.User = Depends(get_current_goods_owner_user), db: Session = Depends(database.get_db)):
    disputes = db.query(models.Dispute).filter(models.Dispute.reported_by_user_id == current_owner.id).order_by(models.Dispute.created_at.desc()).all()
    return disputes
