from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, models, security, database
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
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
@router.post(
    '/loads',
    response_model=schemas.LoadResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_goods_owner_user)],
    summary="Post a New Load (Goods Owner)",
    description="Allows a goods owner to post a new load to the system. The load will initially have a 'pending' status."
)
async def post_new_load_by_owner(load_data: schemas.LoadCreate, current_owner: models.User = Depends(get_current_goods_owner_user), db: Session = Depends(database.get_db)):
    db_load = models.Load(
        **(load_data.model_dump() if hasattr(load_data, 'model_dump') else load_data.dict()), # Pydantic v1/v2 compat
        owner_id=current_owner.id
    )
    db.add(db_load)
    db.commit()
    db.refresh(db_load)
    return db_load

@router.get('/loads', response_model=List[schemas.LoadResponse], dependencies=[Depends(get_current_goods_owner_user)])
async def get_owner_loads(current_owner: models.User = Depends(get_current_goods_owner_user), db: Session = Depends(database.get_db), skip: int = 0, limit: int = 100):
    loads = db.query(models.Load).filter(models.Load.owner_id == current_owner.id).order_by(models.Load.posted_date.desc()).offset(skip).limit(limit).all()
    return loads

# --- Public Goods Owner Info for Loads ---
@router.get('/{owner_id}/public-profile')
async def get_goods_owner_public_profile(owner_id: int, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == owner_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found.')
    profile = db.query(models.GoodsOwnerProfile).filter(models.GoodsOwnerProfile.user_id == owner_id).first()
    result = {
        "owner_id":user.id,
        "username": user.username,
        "email": user.email,
        "company_name": profile.company_name if profile else None,
        "gst_number": profile.gst_number if profile else None,
        "phone_number": profile.phone_number if profile else None
    }
    return result

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


    user = db.query(models.User).filter(models.User.id == owner_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found.')

    profile = db.query(models.GoodsOwnerProfile).filter(models.GoodsOwnerProfile.user_id == owner_id).first()
    user_data = user.__dict__.copy()
    user_data.pop('_sa_instance_state', None)
    # Explicitly include username and email in the merged response
    merged = {"username": user.username, "email": user.email, **user_data}
    if profile:
        profile_data = profile.__dict__.copy()
        profile_data.pop('_sa_instance_state', None)
        merged = {**profile_data, **user_data}  # user_data takes precedence
        merged['username'] = user.username
        merged['email'] = user.email
        # print("DEBUG USER DATA:", user_data)
        # print("DEBUG PROFILE DATA:", profile_data)
        # print("DEBUG MERGED:", merged)
        return merged
    else:
        # print("DEBUG USER DATA:", user_data)
        return user_data

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

# --- Change Password for Goods Owner ---

from pydantic import BaseModel

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str

@router.put('/{owner_id}/password', status_code=200)
async def change_goods_owner_password(
    owner_id: int,
    passwords: PasswordChangeRequest,
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    # Only allow the owner themselves or an admin to change the password
    if current_user.role != UserRole.ADMIN and owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Not authorized to change this password.')

    user = db.query(models.User).filter(models.User.id == owner_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found.')

    # Verify old password
    if not security.verify_password(passwords.old_password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Old password is incorrect.')

    user.hashed_password = security.get_password_hash(passwords.new_password)
    db.add(user)
    db.commit()
    return {"detail": "Password updated successfully"}

# --- Bids for a Load (Goods Owner) ---
@router.get('/loads/{load_id}/bids', response_model=List[schemas.BidResponse], dependencies=[Depends(get_current_goods_owner_user)])
async def get_bids_for_load(load_id: int, db: Session = Depends(database.get_db)):
    bids = db.query(models.Bid).filter(models.Bid.load_id == load_id).all()
    bid_responses = []
    for bid in bids:
        load = db.query(models.Load).filter(models.Load.id == bid.load_id).first()
        driver = db.query(models.User).filter(models.User.id == bid.driver_id).first()
        driver_profile = db.query(models.DriverProfile).filter(models.DriverProfile.user_id == bid.driver_id).first()
        bid_responses.append({
            'id': bid.id,
            'load_id': bid.load_id,
            'amount': bid.amount,
            'driver_id': bid.driver_id,
            'bid_status': bid.bid_status,
            'created_at': str(bid.created_at),
            'goodsType': load.goodsType if load else '',
            'pickupLocation': load.pickupLocation if load else '',
            'deliveryLocation': load.deliveryLocation if load else '',
            'pickupDate': load.pickupDate if load else '',
            'deliveryDate': load.deliveryDate if load else '',
            'status': load.status if load else '',
            'driver_name': driver.username if driver else '',
            'driver_email': driver.email if driver else '',
            'driver_phone': driver_profile.phone_number if driver_profile else '',
        })
    return bid_responses

# --- Hire a Driver for a Load (Goods Owner) ---
from fastapi import Request
@router.put('/loads/{load_id}/hire', status_code=200)
async def hire_driver_for_load(load_id: int, driver_id: int = None, db: Session = Depends(database.get_db), request: Request = None):
    # Only allow if driver_id is provided
    if not driver_id:
        raise HTTPException(status_code=400, detail='driver_id is required')
    load = db.query(models.Load).filter(models.Load.id == load_id).first()
    if not load:
        raise HTTPException(status_code=404, detail='Load not found')
    # Assign driver and set status to active
    load.status = 'active'
    load.accepted_driver_id = driver_id
    db.add(load)
    # Update the bid status for the hired driver
    bid = db.query(models.Bid).filter(models.Bid.load_id == load_id, models.Bid.driver_id == driver_id).first()
    if bid:
        bid.bid_status = 'AWAITING_DRIVER_RESPONSE'
        db.add(bid)
    db.commit()
    db.refresh(load)
    return {"detail": "Driver hired and load activated", "load_id": load_id, "driver_id": driver_id}

# --- Goods Owner Dispute Management ---
# POST /api/owner/disputes (Frontend path) -> Our router prefix is /api/v1/owners
@router.post('/disputes', response_model=schemas.DisputeResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_goods_owner_user)])
async def create_owner_dispute(dispute_data: schemas.DisputeCreate, current_owner: models.User = Depends(get_current_goods_owner_user), db: Session = Depends(database.get_db)):
    if dispute_data.loadId:
        load = db.query(models.Load).filter(models.Load.id == dispute_data.loadId).first()
        if not load:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Related load with id {dispute_data.loadId} not found.')
        if load.owner_id != current_owner.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Cannot raise dispute for a load not owned by you.')

    db_dispute = models.Dispute(
        driverId=getattr(dispute_data, 'driverId', None),
        loadId=dispute_data.loadId,
        disputeType=dispute_data.disputeType,
        message=dispute_data.message,
        attachments=dispute_data.attachments,
        status='open'
    )
    db.add(db_dispute)
    db.commit()
    db.refresh(db_dispute)
    return db_dispute

# GET /api/owner/disputes (Frontend path)
@router.get('/disputes', response_model=List[schemas.DisputeResponse], dependencies=[Depends(get_current_goods_owner_user)])
async def get_owner_disputes(current_owner: models.User = Depends(get_current_goods_owner_user), db: Session = Depends(database.get_db)):
    # Get all load IDs for the current owner
    owned_load_ids = db.query(models.Load.id).filter(models.Load.owner_id == current_owner.id).all()
    owned_load_ids = [lid[0] for lid in owned_load_ids]
    disputes = db.query(models.Dispute).filter(models.Dispute.loadId.in_(owned_load_ids)).order_by(models.Dispute.created_at.desc()).all()
    return disputes
