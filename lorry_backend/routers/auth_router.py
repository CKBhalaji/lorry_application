from fastapi import APIRouter, Depends, HTTPException, status, Body
import smtplib
import random
from email.mime.text import MIMEText
from typing import Dict
from email_validator import validate_email, EmailNotValidError
from fastapi.security import OAuth2PasswordRequestForm # For login form
from sqlalchemy.orm import Session

from .. import schemas, models, security, database # Adjusted import paths

router = APIRouter(
    prefix='/api/auth', # Adding a version prefix
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
            'id': user.id,
            'username': user.username,
            'type': user.role.value
        }
    }

# OTP logic with email sending and verification


# In-memory OTP store (for demo; use Redis or DB for production)
otp_store: Dict[str, str] = {}

def send_otp_email(to_email: str, otp: str):
    user = 'neelabhalaji2003@gmail.com'
    password = 'ngibtkttpiptmtgs'
    subject = " Logistics Transport Your OTP Code"
    body = f"Welcome! Your OTP code is: {otp}"

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = user
    msg['To'] = to_email

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(user, password)
        server.sendmail(user, to_email, msg.as_string())

@router.post('/verification/send')
async def send_verification_otp(email_data: schemas.EmailSchemaForOTP):
    try:
    # Validate email
        valid = validate_email(email_data.email)
        email = valid.email
    except EmailNotValidError as e:
        raise HTTPException(status_code=400, detail=str(e))

    otp = f'{random.randint(1000, 9999)}'
    otp_store[email] = otp
    try:
        send_otp_email(email, otp)
        return {"message": "OTP sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")

@router.post('/verification/verify')
async def verify_otp(verification_data: schemas.OTPVerificationRequest):
    email = verification_data.email
    otp = verification_data.otp
    if otp_store.get(email) == otp:
        del otp_store[email]
        return {"message": "OTP verified"}
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid OTP')
