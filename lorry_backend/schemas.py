from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from .models import UserRole # Import UserRole enum from models.py
import enum

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    UserRole: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    role: UserRole # Use the enum here

class UserLogin(BaseModel):
    username: str # Can be username or email
    password: str

class UserInDB(UserBase):
    id: int
    role: UserRole
    is_active: bool

    class Config:
        orm_mode = True # Pydantic v1, or from_attributes = True for Pydantic v2

# Driver Profile Schemas
class DriverProfileBase(BaseModel):
    phone_number: Optional[str] = None
    aadhar_number: Optional[str] = None
    experience: Optional[str] = None
    driving_license_filename: Optional[str] = None
    insurance_filename: Optional[str] = None
    rc_card_filename: Optional[str] = None
    vehicle_type: Optional[str] = None
    custom_vehicle_type: Optional[str] = None
    load_capacity_kg: Optional[int] = None
    gpay_id: Optional[str] = None
    paytm_id: Optional[str] = None
    upi_id: Optional[str] = None

class DriverProfileCreate(DriverProfileBase):
    pass # All fields are optional for now, can be made mandatory as needed

class DriverProfileUpdate(DriverProfileBase):
    pass

class DriverProfileResponse(DriverProfileBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True # Pydantic v1, or from_attributes = True for Pydantic v2

class DriverUserCreate(UserCreate): # For signup
    profile: Optional[DriverProfileCreate] = None


# Goods Owner Profile Schemas
class GoodsOwnerProfileBase(BaseModel):
    company_name: Optional[str] = None
    gst_number: Optional[str] = None
    # Add other fields as necessary

class GoodsOwnerProfileCreate(GoodsOwnerProfileBase):
    pass

class GoodsOwnerProfileUpdate(GoodsOwnerProfileBase):
    pass

class GoodsOwnerProfileResponse(GoodsOwnerProfileBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True # Pydantic v1, or from_attributes = True for Pydantic v2

class GoodsOwnerUserCreate(UserCreate): # For signup
    profile: Optional[GoodsOwnerProfileCreate] = None

# OTP Schemas
class EmailSchemaForOTP(BaseModel):
    email: EmailStr

class OTPVerificationRequest(BaseModel):
    email: EmailStr
    otp: str

# Schemas for other models (Loads, Bids, Disputes) will be added later
# class LoadBase(BaseModel): ...
# class LoadCreate(LoadBase): ...
# class LoadResponse(LoadBase): ...

# class BidBase(BaseModel): ...
# class BidCreate(BidBase): ...
# class BidResponse(BidBase): ...

# class DisputeBase(BaseModel): ...
# class DisputeCreate(DisputeBase): ...
# class DisputeResponse(DisputeBase): ...


# Schemas for Loads
class LoadBase(BaseModel):
    pickup_location: str
    dropoff_location: str
    load_description: Optional[str] = None
    load_weight_kg: Optional[int] = None
    status: Optional[str] = 'pending'

class LoadCreate(LoadBase):
    pass

class LoadUpdate(BaseModel):
    pickup_location: Optional[str] = None
    dropoff_location: Optional[str] = None
    load_description: Optional[str] = None
    load_weight_kg: Optional[int] = None
    status: Optional[str] = None

class LoadResponse(LoadBase):
    id: int
    owner_id: int
    posted_date: str # Assuming string representation

    class Config:
        orm_mode = True # Pydantic v1, or from_attributes = True for Pydantic v2

# Schemas for Disputes
class DisputeBase(BaseModel):
    dispute_reason: str
    related_load_id: Optional[int] = None

class DisputeCreate(DisputeBase):
    pass # reported_by_user_id will be taken from current user

class DisputeUpdate(BaseModel):
    status: Optional[str] = None
    resolution_details: Optional[str] = None

class DisputeResponse(DisputeBase):
    id: int
    reported_by_user_id: int
    status: str
    resolution_details: Optional[str] = None
    created_at: str # Assuming string representation

    class Config:
        orm_mode = True # Pydantic v1, or from_attributes = True for Pydantic v2

# Schemas for Bids
class BidBase(BaseModel):
    load_id: int
    amount: int # Or float

class BidCreate(BidBase):
    pass # driver_id will be from current_user

class BidUpdate(BaseModel):
    amount: Optional[int] = None
    bid_status: Optional[str] = None

class BidResponse(BidBase):
    id: int
    driver_id: int
    bid_status: str
    created_at: str

    class Config:
        orm_mode = True # Pydantic v1, or from_attributes = True for Pydantic v2
