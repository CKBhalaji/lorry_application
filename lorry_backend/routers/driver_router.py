from fastapi import UploadFile, APIRouter, File, Query, HTTPException, status, Depends
import os
from ..config import settings
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, models, security, database
from ..models import UserRole

router = APIRouter(
    prefix='/api/drivers', # Aligning with frontend /api/drivers path structure
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
    available_loads = db.query(models.Load).filter(models.Load.status == 'pending').order_by(models.Load.posted_date.desc()).offset(skip).limit(limit).all()
    return available_loads

# --- Bid functionalities for Drivers ---
@router.post('/bids', response_model=schemas.BidResponse, status_code=status.HTTP_201_CREATED)
async def place_bid_on_load(bid_data: schemas.BidCreate, db: Session = Depends(database.get_db)):
    load_exists = db.query(models.Load).filter(models.Load.id == bid_data.load_id).first()
    if not load_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Load with id {bid_data.load_id} not found.')
    if load_exists.status != 'pending' and load_exists.status != 'active': # Example condition
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f'Load is not available for bidding.')

    # Only allow one bid per driver per load: update amount if exists, else create new
    db_bid = db.query(models.Bid).filter(models.Bid.load_id == bid_data.load_id, models.Bid.driver_id == bid_data.driver_id).first()
    if db_bid:
        db_bid.amount = bid_data.amount
        db_bid.bid_status = 'pending'  # Optionally reset status to pending
        db.add(db_bid)
    else:
        db_bid = models.Bid(
            load_id=bid_data.load_id,
            driver_id=bid_data.driver_id,
            amount=bid_data.amount,
            bid_status='pending' # Initial status
        )
        db.add(db_bid)
    # Update the load's current_highest_bid if this bid is higher
    if load_exists.current_highest_bid is None or bid_data.amount > load_exists.current_highest_bid:
        load_exists.current_highest_bid = bid_data.amount
        db.add(load_exists)
    db.commit()
    db.refresh(db_bid)
    # Compose response with all required fields
    load = db.query(models.Load).filter(models.Load.id == db_bid.load_id).first()
    driver = db.query(models.User).filter(models.User.id == db_bid.driver_id).first()
    driver_profile = db.query(models.DriverProfile).filter(models.DriverProfile.user_id == db_bid.driver_id).first()
    return {
        'id': db_bid.id,
        'load_id': db_bid.load_id,
        'amount': db_bid.amount,
        'driver_id': db_bid.driver_id,
        'bid_status': db_bid.bid_status,
        'created_at': str(db_bid.created_at),
        'goodsType': load.goodsType if load else '',
        'pickupLocation': load.pickupLocation if load else '',
        'deliveryLocation': load.deliveryLocation if load else '',
        'pickupDate': load.pickupDate if load else '',
        'deliveryDate': load.deliveryDate if load else '',
        'status': load.status if load else '',
        'load_status': load.status if load else '',
        'load_acceptedDriverId': load.accepted_driver_id if load else None,
        'driver_name': driver.username if driver else '',
        'driver_email': driver.email if driver else '',
        'driver_phone': driver_profile.phone_number if driver_profile else '',
    }

# --- My Loads for Drivers ---
@router.get('/my-loads', response_model=List[schemas.LoadResponse], summary="Get My Loads for Driver", description="Fetches loads where the driver is the accepted driver or has declined, and status is not 'pending'.")
async def get_my_loads_for_driver(current_user: models.User = Depends(get_current_driver_user), db: Session = Depends(database.get_db)):
    # Loads where driver is accepted or has declined a bid, and status is not 'pending'
    # Loads where driver is accepted (any status except 'pending')
    accepted_loads = db.query(models.Load).filter(models.Load.accepted_driver_id == current_user.id).all()
    # Loads where driver has declined a bid (any status)
    declined_bid_load_ids = db.query(models.Bid.load_id).filter(models.Bid.driver_id == current_user.id, models.Bid.bid_status == 'DECLINED').subquery()
    declined_loads = db.query(models.Load).filter(models.Load.id.in_(declined_bid_load_ids.select())).all()
    # Loads where driver has any bid and load is cancelled
    cancelled_bid_load_ids = db.query(models.Bid.load_id).filter(models.Bid.driver_id == current_user.id).subquery()
    cancelled_loads = db.query(models.Load).filter(models.Load.id.in_(cancelled_bid_load_ids.select()), models.Load.status == 'cancelled').all()
    # Loads where driver has NOT_HIRED_BY_OWNER bid
    not_hired_bid_load_ids = db.query(models.Bid.load_id).filter(models.Bid.driver_id == current_user.id, models.Bid.bid_status == 'NOT_HIRED_BY_OWNER').subquery()
    not_hired_loads = db.query(models.Load).filter(models.Load.id.in_(not_hired_bid_load_ids.select())).all()
    # Combine and remove duplicates
    all_loads = {load.id: load for load in accepted_loads + declined_loads + cancelled_loads + not_hired_loads}.values()
    # Add driver details to each load for frontend display
    driver = db.query(models.User).filter(models.User.id == current_user.id).first()
    driver_profile = db.query(models.DriverProfile).filter(models.DriverProfile.user_id == current_user.id).first()
    loads_with_driver = []
    for load in all_loads:
        load_dict = load.__dict__.copy()
        load_dict['driver_name'] = driver.username if driver else ''
        load_dict['driver_email'] = driver.email if driver else ''
        load_dict['driver_phone'] = driver_profile.phone_number if driver_profile else ''
        load_dict.pop('_sa_instance_state', None)
        loads_with_driver.append(load_dict)
    return loads_with_driver

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


    # Always show the latest bid per load for the driver, regardless of status
    from sqlalchemy import func
    subq = db.query(
        models.Bid.load_id,
        func.max(models.Bid.created_at).label('max_created_at')
    ).filter(
        models.Bid.driver_id == driver_id
    ).group_by(models.Bid.load_id).subquery()

    bids = db.query(models.Bid, models.Load).join(
        subq,
        (models.Bid.load_id == subq.c.load_id) & (models.Bid.created_at == subq.c.max_created_at)
    ).join(
        models.Load, models.Bid.load_id == models.Load.id
    ).filter(
        models.Bid.bid_status.in_(['pending', 'AWAITING_DRIVER_RESPONSE']),
        models.Load.status.in_(['pending', 'awaiting_driver_response', 'active', 'assigned', 'in_transit'])
    ).order_by(models.Bid.created_at.desc()).all()
    if not bids:
        return []
    bid_responses = []
    for bid, load in bids:
        driver = db.query(models.User).filter(models.User.id == bid.driver_id).first()
        driver_profile = db.query(models.DriverProfile).filter(models.DriverProfile.user_id == bid.driver_id).first()
        response_bid_status = bid.bid_status
        bid_responses.append({
            'id': bid.id,
            'load_id': bid.load_id,
            'amount': bid.amount,
            'driver_id': bid.driver_id,
            'bid_status': response_bid_status,
            'created_at': str(bid.created_at),
            'goodsType': load.goodsType if load else '',
            'pickupLocation': load.pickupLocation if load else '',
            'deliveryLocation': load.deliveryLocation if load else '',
            'pickupDate': load.pickupDate if load else '',
            'deliveryDate': load.deliveryDate if load else '',
            'status': load.status if load else '',
            'load_status': load.status if load else '',
            'load_accepted_driver_id': load.accepted_driver_id if load else None,
            'owner_id': load.owner_id if load else None,
            'driver_name': driver.username if driver else '',
            'driver_email': driver.email if driver else '',
            'driver_phone': driver_profile.phone_number if driver_profile else '',
        })
    return bid_responses

# --- Accept/Decline Bid (Driver) ---
@router.put('/bids/{bid_id}/accept', status_code=200)
async def accept_bid(bid_id: int, db: Session = Depends(database.get_db)):
    bid = db.query(models.Bid).filter(models.Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(status_code=404, detail='Bid not found')
    bid.bid_status = 'ACCEPTED'
    db.add(bid)
    # Also update the load status to 'assigned' and set accepted_driver_id
    load = db.query(models.Load).filter(models.Load.id == bid.load_id).first()
    if load:
        load.status = 'assigned'
        load.accepted_driver_id = bid.driver_id
        db.add(load)
    db.commit()
    db.refresh(bid)
    return {"detail": "Bid accepted", "bid_id": bid_id}

@router.put('/bids/{bid_id}/decline', status_code=200)
async def decline_bid(bid_id: int, db: Session = Depends(database.get_db)):
    bid = db.query(models.Bid).filter(models.Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(status_code=404, detail='Bid not found')
    bid.bid_status = 'DECLINED'
    db.add(bid)
    # If this driver is the accepted driver and the load is awaiting response, set load status to 'pending' for reassignment
    load = db.query(models.Load).filter(models.Load.id == bid.load_id).first()
    if load and load.accepted_driver_id == bid.driver_id and load.status == 'awaiting_driver_response':
        load.status = 'pending'
        load.accepted_driver_id = None
        db.add(load)
    db.commit()
    db.refresh(bid)
    return {"detail": "Bid declined", "bid_id": bid_id}

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
    user = db.query(models.User).filter(models.User.id == driver_id).first()
    response = profile.__dict__.copy()
    response.pop('_sa_instance_state', None)
    response['username'] = user.username if user else ''
    response['email'] = user.email if user else ''
    return response

# PUT /api/drivers/{driverId}/password - Change password for driver
@router.put('/{driver_id}/password', status_code=200)
async def change_driver_password(driver_id: int, passwords: schemas.PasswordChangeRequest, current_user: models.User = Depends(security.get_current_active_user), db: Session = Depends(database.get_db)):
    # Only allow the driver themselves or an admin to change the password
    if current_user.role != UserRole.ADMIN and driver_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Not authorized to change this password.')
    user = db.query(models.User).filter(models.User.id == driver_id, models.User.role == UserRole.DRIVER).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Driver not found.')
    # Verify old password
    if not security.verify_password(passwords.old_password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Old password is incorrect.')
    user.hashed_password = security.get_password_hash(passwords.new_password)
    db.add(user)
    db.commit()
    return {"detail": "Password updated successfully"}

# PUT /api/drivers/{driverId}/profile - Assuming this means updating DriverProfile model
@router.put('/{driver_id}/profile', response_model=schemas.DriverProfileResponse, dependencies=[Depends(get_current_driver_user)]) # Keep specific driver dependency for updates
async def update_driver_profile(driver_id: int, profile_data: schemas.DriverProfileUpdate, current_driver: models.User = Depends(get_current_driver_user), db: Session = Depends(database.get_db)):
    if driver_id != current_driver.id: # This check is somewhat redundant due to get_current_driver_user and path matching, but good for clarity
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='You can only update your own profile.')

    db_profile = db.query(models.DriverProfile).filter(models.DriverProfile.user_id == driver_id).first()
    if not db_profile: # Should be caught by get_current_driver_user if profile doesn't exist
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Driver profile not found.')

    update_data = profile_data.model_dump(exclude_unset=True)
    # Update DriverProfile fields
    for key, value in update_data.items():
        if hasattr(db_profile, key):
            setattr(db_profile, key, value)
    # Update User fields if present
    user = db.query(models.User).filter(models.User.id == driver_id).first()
    if 'username' in update_data and user:
        user.username = update_data['username']
    if 'email' in update_data and user:
        user.email = update_data['email']
    db.add(db_profile)
    if user:
        db.add(user)
    db.commit()
    db.refresh(db_profile)
    # Return updated profile with username and email
    response = db_profile.__dict__.copy()
    response.pop('_sa_instance_state', None)
    response['username'] = user.username if user else ''
    response['email'] = user.email if user else ''
    return response

# --- Update Load Status (Driver) ---
@router.put('/loads/{load_id}/status', status_code=200)
async def update_load_status(load_id: int, status_update: schemas.LoadUpdate, db: Session = Depends(database.get_db)):
    load = db.query(models.Load).filter(models.Load.id == load_id).first()
    if not load:
        raise HTTPException(status_code=404, detail='Load not found')
    if not status_update.status:
        raise HTTPException(status_code=400, detail='Status is required')
    load.status = status_update.status
    db.add(load)
    db.commit()
    db.refresh(load)
    return {"detail": "Load status updated", "load_id": load_id, "status": load.status}

# --- Driver Dispute Management ---
# POST /api/driver/disputes (Frontend path) -> Our router prefix is /api/drivers
@router.post('/disputes', response_model=schemas.DisputeResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_driver_user)])
async def create_driver_dispute(dispute_data: schemas.DisputeCreate, current_driver: models.User = Depends(get_current_driver_user), db: Session = Depends(database.get_db)):
    if dispute_data.loadId:
        load_exists = db.query(models.Load).filter(models.Load.id == dispute_data.loadId).first()
        if not load_exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Related load with id {dispute_data.loadId} not found.')

    from datetime import datetime
    db_dispute = models.Dispute(
        driverId=current_driver.id,
        loadId=dispute_data.loadId,
        disputeType=getattr(dispute_data, 'disputeType', None),
        message=dispute_data.message,
        attachments=getattr(dispute_data, 'attachments', None),
        status='open',
        created_at=datetime.utcnow().isoformat()
    )
    db.add(db_dispute)
    db.commit()
    db.refresh(db_dispute)
    return db_dispute

# GET /api/driver/disputes (Frontend path)
@router.get('/disputes', dependencies=[Depends(get_current_driver_user)])
async def get_driver_disputes(current_driver: models.User = Depends(get_current_driver_user), db: Session = Depends(database.get_db)):
    # Fetch disputes where the driver is the subject (against him)
    disputes = db.query(models.Dispute).filter(models.Dispute.driverId == current_driver.id).order_by(models.Dispute.created_at.desc()).all()
    print(f"DEBUG: Found {len(disputes)} disputes for driverId={current_driver.id}")
    dispute_responses = []
    for dispute in disputes:
        driver = db.query(models.User).filter(models.User.id == dispute.driverId).first()
        load = db.query(models.Load).filter(models.Load.id == dispute.loadId).first()
        driver_profile = db.query(models.DriverProfile).filter(models.DriverProfile.user_id == dispute.driverId).first()
        # print(f"DEBUG dispute.id={dispute.id} driverId={dispute.driverId} driver={driver} driver_profile={driver_profile}")
        # Fetch owner details from load
        dispute_responses.append({
            'id': dispute.id,
            'driverId': dispute.driverId,
            'loadId': dispute.loadId,
            'disputeType': dispute.disputeType,
            'message': dispute.message,
            'attachments': dispute.attachments,
            'status': dispute.status,
            'resolution_details': dispute.resolution_details,
            'created_at': dispute.created_at,
            'driver_name': driver.username if driver else '',
            'driver_email': driver.email if driver else '',
            'driver_phone': driver_profile.phone_number if driver_profile else '',
            'load_status': load.status if load else '',
            'load_goodsType': load.goodsType if load else '',
        })
    # print(f"DEBUG dispute_responses to return: {dispute_responses}")
    return dispute_responses

@router.post('/{driver_id}/upload')
async def upload_driver_document(
    driver_id: int,
    docType: str = Query(..., description="Type of document: driving_license, insurance, rc_card"),
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db)
):
    # Validate docType
    allowed_types = {
        "driving_license": "driving_license_filename",
        "insurance": "insurance_filename",
        "rc_card": "rc_card_filename"
    }
    if docType not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid docType")

    # Get driver profile
    profile = db.query(models.DriverProfile).filter(models.DriverProfile.user_id == driver_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Driver profile not found")

    # Save file to uploads directory
    upload_dir = settings.UPLOAD_DIRECTORY if hasattr(settings, "UPLOAD_DIRECTORY") else "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_location = os.path.join(upload_dir, f"driver_{driver_id}_{docType}_{file.filename}")
    with open(file_location, "wb") as buffer:
        buffer.write(await file.read())

    # Update the correct field in the profile
    setattr(profile, allowed_types[docType], os.path.basename(file_location))
    db.add(profile)
    db.commit()
    db.refresh(profile)

    return {"message": f"{docType} uploaded successfully", "filename": os.path.basename(file_location)}