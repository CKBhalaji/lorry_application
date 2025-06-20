from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm # For login form
from sqlalchemy.orm import Session

from .. import schemas, models, security, database # Adjusted import paths

router = APIRouter(
    prefix='/api/v1/auth', # Adding a version prefix
    tags=['Authentication']
)

@router.post('/signup/driver', response_model=schemas.UserInDB, status_code=status.HTTP_201_CREATED)
async def signup_driver(user_data: schemas.DriverUserCreate, db: Session = Depends(database.get_db)):
    existing_user_email = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Email already registered')

    existing_user_username = db.query(models.User).filter(models.User.username == user_data.username).first()
    if existing_user_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Username already taken')

    hashed_password = security.get_password_hash(user_data.password)

    db_user = models.User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        role=models.UserRole.DRIVER # Directly use the enum from models
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    if user_data.profile:
        # Ensure profile data is converted to dict if it's a Pydantic model
        profile_data = user_data.profile.model_dump() if hasattr(user_data.profile, 'model_dump') else user_data.profile.dict()
        db_driver_profile = models.DriverProfile(**profile_data, user_id=db_user.id)
        db.add(db_driver_profile)
        db.commit()
        db.refresh(db_driver_profile)
        # db_user.driver_profile = db_driver_profile # establish relationship if needed for response

    return db_user

@router.post('/signup/goods-owner', response_model=schemas.UserInDB, status_code=status.HTTP_201_CREATED)
async def signup_goods_owner(user_data: schemas.GoodsOwnerUserCreate, db: Session = Depends(database.get_db)):
    existing_user_email = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Email already registered')

    existing_user_username = db.query(models.User).filter(models.User.username == user_data.username).first()
    if existing_user_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Username already taken')

    hashed_password = security.get_password_hash(user_data.password)
    db_user = models.User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        role=models.UserRole.GOODS_OWNER # Directly use the enum from models
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    if user_data.profile:
        # Ensure profile data is converted to dict
        profile_data = user_data.profile.model_dump() if hasattr(user_data.profile, 'model_dump') else user_data.profile.dict()
        db_goods_owner_profile = models.GoodsOwnerProfile(**profile_data, user_id=db_user.id)
        db.add(db_goods_owner_profile)
        db.commit()
        db.refresh(db_goods_owner_profile)
        # db_user.goods_owner_profile = db_goods_owner_profile # establish relationship

    return db_user

@router.post(
    '/login',
    response_model=schemas.Token,
    summary="User Login",
    description="Login with username (or email) and password to obtain an access token."
)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    # Try to fetch user by username first
    user = db.query(models.User).filter(models.User.username == form_data.username).first()

    # If not found by username, try by email
    if not user:
        user = db.query(models.User).filter(models.User.email == form_data.username).first()

    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect username or password',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Inactive user')

    access_token = security.create_access_token(data={'sub': user.username}) # 'sub' is standard for subject (username)
    return {
        'access_token': access_token,
        'token_type': 'bearer',
        'user': {
            'username': user.username,
            'type': user.role.value
        }
    }

# Stubbed OTP endpoints as per plan
@router.post('/verification/send')
async def send_verification_otp(email_data: schemas.EmailSchemaForOTP):
    # For Pydantic v2, EmailStr is a type, not a schema itself for request body.
    # Need a schema like: class EmailSchema(BaseModel): email: EmailStr
    # However, the instruction suggests `email: schemas.EmailStr` which implies it might be part of a larger model
    # or that FastAPI can handle it directly from query/path params. For a POST body, it needs a Pydantic model.
    # Let's assume it's meant to be a simple request with an email field.
    # For now, let's define a simple schema here or assume one exists in schemas.py
    # For the purpose of this step, proceeding with the direct use, but this might need adjustment.
    print(f'OTP send request for {email_data.email}') # Server-side log
    return {'message': 'OTP send request acknowledged. Please use /verify to verify.'}


@router.post('/verification/verify')
async def verify_otp(verification_data: schemas.OTPVerificationRequest): # Basic for now
    # Assuming OTPVerificationRequest is defined in schemas.py:
    # class OTPVerificationRequest(BaseModel):
    #     email: EmailStr
    #     otp: str
    print(f'OTP verification request for {verification_data.email} with OTP {verification_data.otp}') # Server-side log
    if verification_data.otp == '1234': # Placeholder verification
        return {'message': 'OTP verified successfully.'}
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid OTP')
