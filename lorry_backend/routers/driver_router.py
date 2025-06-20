from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, models, security, database
from ..models import UserRole

router = APIRouter(
    prefix='/api/v1/drivers', # Aligning with frontend /api/drivers path structure
    tags=['Drivers'],
    dependencies=[Depends(security.get_current_active_user)]
)

# Dependency to check if the user is a driver
async def get_current_driver_user(current_user: models.User = Depends(security.get_current_active_user)):
    if current_user.role != UserRole.DRIVER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='User is not a driver')
    if not current_user.driver_profile: # Ensure driver profile exists
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Driver profile not found for user')
    return current_user

# --- Load functionalities for Drivers ---
@router.get(
    '/loads',
    response_model=List[schemas.LoadResponse],
    dependencies=[Depends(get_current_driver_user)],
    summary="Get Available Loads for Driver",
    description="Fetches a list of currently available loads (e.g., status 'pending' or 'active') for drivers."
)
async def get_available_loads_for_driver(db: Session = Depends(database.get_db), skip: int = 0, limit: int = 100):
    # Fetch loads that are 'pending' or 'active' (or whatever status means available)
    # This might need more complex filtering based on driver's vehicle, location etc. in future
    available_loads = db.query(models.Load).filter(models.Load.status.in_(['pending', 'active'])).order_by(models.Load.posted_date.desc()).offset(skip).limit(limit).all()
    return available_loads

# --- Bid functionalities for Drivers ---
@router.post('/bids', response_model=schemas.BidResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_driver_user)])
async def place_bid_on_load(bid_data: schemas.BidCreate, current_driver: models.User = Depends(get_current_driver_user), db: Session = Depends(database.get_db)):
    load_exists = db.query(models.Load).filter(models.Load.id == bid_data.load_id).first()
    if not load_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Load with id {bid_data.load_id} not found.')
    if load_exists.status != 'pending' and load_exists.status != 'active': # Example condition
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f'Load is not available for bidding.')

    # Check if driver already bid on this load - optional, depends on rules
    existing_bid = db.query(models.Bid).filter(models.Bid.load_id == bid_data.load_id, models.Bid.driver_id == current_driver.id).first()
    if existing_bid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='You have already placed a bid on this load.')

    db_bid = models.Bid(
        load_id=bid_data.load_id,
        driver_id=current_driver.id,
        amount=bid_data.amount,
        bid_status='pending' # Initial status
    )
    db.add(db_bid)
    db.commit()
    db.refresh(db_bid)
    return db_bid

# As per frontend: GET /api/drivers/{driverId}/bids - so we use driver_id in path
@router.get('/{driver_id}/bids', response_model=List[schemas.BidResponse]) # Removed get_current_driver_user dependency to allow flexibility if an admin needs to access this - auth is still via main dependency
async def get_driver_bids(driver_id: int, current_user: models.User = Depends(security.get_current_active_user), db: Session = Depends(database.get_db)):
    # Permission check: User must be the driver themselves or an admin
    if current_user.role != UserRole.ADMIN and driver_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Not authorized to view these bids.')

    # Ensure the user being queried is actually a driver, if current user is not admin
    if current_user.role != UserRole.ADMIN:
        queried_user_is_driver = db.query(models.User).filter(models.User.id == driver_id, models.User.role == UserRole.DRIVER).first()
        if not queried_user_is_driver:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Driver with id {driver_id} not found or is not a driver.')


    bids = db.query(models.Bid).filter(models.Bid.driver_id == driver_id).order_by(models.Bid.created_at.desc()).all()
    if not bids:
        # Return empty list if no bids, or raise 404 if driver_id itself is invalid and not caught by user check
        # The user check above should handle invalid driver_id if not admin
        pass # Fall through to return empty list
    return bids

# --- Driver Profile Management ---
# GET /api/drivers/{driverId}/profile
@router.get('/{driver_id}/profile', response_model=schemas.DriverProfileResponse) # Auth via main dependency
async def get_driver_profile(driver_id: int, current_user: models.User = Depends(security.get_current_active_user), db: Session = Depends(database.get_db)):
    # Permission check: User must be the driver themselves or an admin
    if current_user.role != UserRole.ADMIN and driver_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Not authorized to view this profile.')

    profile = db.query(models.DriverProfile).join(models.User).filter(models.DriverProfile.user_id == driver_id, models.User.role == UserRole.DRIVER).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Driver profile not found for the specified user ID, or user is not a driver.')
    return profile

# PUT /api/drivers/{driverId}/profile - Assuming this means updating DriverProfile model
@router.put('/{driver_id}/profile', response_model=schemas.DriverProfileResponse, dependencies=[Depends(get_current_driver_user)]) # Keep specific driver dependency for updates
async def update_driver_profile(driver_id: int, profile_data: schemas.DriverProfileUpdate, current_driver: models.User = Depends(get_current_driver_user), db: Session = Depends(database.get_db)):
    if driver_id != current_driver.id: # This check is somewhat redundant due to get_current_driver_user and path matching, but good for clarity
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='You can only update your own profile.')

    db_profile = db.query(models.DriverProfile).filter(models.DriverProfile.user_id == driver_id).first()
    if not db_profile: # Should be caught by get_current_driver_user if profile doesn't exist
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Driver profile not found.')

    update_data = profile_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_profile, key, value)

    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

# --- Driver Dispute Management ---
# POST /api/driver/disputes (Frontend path) -> Our router prefix is /api/v1/drivers
@router.post('/disputes', response_model=schemas.DisputeResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_driver_user)])
async def create_driver_dispute(dispute_data: schemas.DisputeCreate, current_driver: models.User = Depends(get_current_driver_user), db: Session = Depends(database.get_db)):
    if dispute_data.related_load_id:
        load_exists = db.query(models.Load).filter(models.Load.id == dispute_data.related_load_id).first()
        if not load_exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Related load with id {dispute_data.related_load_id} not found.')

    db_dispute = models.Dispute(
        reported_by_user_id=current_driver.id,
        related_load_id=dispute_data.related_load_id,
        dispute_reason=dispute_data.dispute_reason,
        status='open'
    )
    db.add(db_dispute)
    db.commit()
    db.refresh(db_dispute)
    return db_dispute

# GET /api/driver/disputes (Frontend path)
@router.get('/disputes', response_model=List[schemas.DisputeResponse], dependencies=[Depends(get_current_driver_user)])
async def get_driver_disputes(current_driver: models.User = Depends(get_current_driver_user), db: Session = Depends(database.get_db)):
    disputes = db.query(models.Dispute).filter(models.Dispute.reported_by_user_id == current_driver.id).order_by(models.Dispute.created_at.desc()).all()
    return disputes
