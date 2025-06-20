from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SQLAlchemyEnum, Text, Boolean
from sqlalchemy.orm import relationship
from .database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = 'admin'
    DRIVER = 'driver'
    GOODS_OWNER = 'goods_owner'

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLAlchemyEnum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)

    driver_profile = relationship('DriverProfile', back_populates='user', uselist=False)
    goods_owner_profile = relationship('GoodsOwnerProfile', back_populates='user', uselist=False)
    # If admins have specific profile data, add a relationship here too.

class DriverProfile(Base):
    __tablename__ = 'driver_profiles'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    phone_number = Column(String, nullable=True)
    aadhar_number = Column(String, nullable=True)
    experience = Column(String, nullable=True) # E.g., '2 years', '5+ years'
    driving_license_filename = Column(String, nullable=True)
    insurance_filename = Column(String, nullable=True)
    rc_card_filename = Column(String, nullable=True)
    vehicle_type = Column(String, nullable=True)
    custom_vehicle_type = Column(String, nullable=True) # If vehicle_type is 'Other'
    load_capacity_kg = Column(Integer, nullable=True)
    gpay_id = Column(String, nullable=True)
    paytm_id = Column(String, nullable=True)
    upi_id = Column(String, nullable=True)

    user = relationship('User', back_populates='driver_profile')

class GoodsOwnerProfile(Base):
    __tablename__ = 'goods_owner_profiles'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    company_name = Column(String, nullable=True)
    gst_number = Column(String, nullable=True)
    # Add other goods_owner specific fields based on frontend analysis if any

    user = relationship('User', back_populates='goods_owner_profile')

# Future models (placeholder comments, will be detailed in their respective steps)
# class Load(Base): ...
# class Bid(Base): ...
# class Dispute(Base): ...


# Added for Admin/Load/Dispute management
class Load(Base):
    __tablename__ = 'loads'

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    pickup_location = Column(String, nullable=False)
    dropoff_location = Column(String, nullable=False)
    load_description = Column(Text, nullable=True)
    load_weight_kg = Column(Integer, nullable=True)
    status = Column(String, default='pending') # e.g., pending, active, completed, cancelled
    posted_date = Column(String, server_default=str(datetime.utcnow())) # Using String for simplicity, can be DateTime

    owner = relationship('User') # Relationship to the user who posted the load
    # bids = relationship('Bid', back_populates='load') # If Bid model is linked

class Dispute(Base):
    __tablename__ = 'disputes'

    id = Column(Integer, primary_key=True, index=True)
    reported_by_user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    related_load_id = Column(Integer, ForeignKey('loads.id'), nullable=True)
    dispute_reason = Column(Text, nullable=False)
    status = Column(String, default='open') # e.g., open, under_review, resolved, closed
    resolution_details = Column(Text, nullable=True)
    created_at = Column(String, server_default=str(datetime.utcnow())) # Using String for simplicity

    reported_by = relationship('User')
    related_load = relationship('Load')


# Added for Driver/Bid management
class Bid(Base):
    __tablename__ = 'bids'

    id = Column(Integer, primary_key=True, index=True)
    load_id = Column(Integer, ForeignKey('loads.id'), nullable=False)
    driver_id = Column(Integer, ForeignKey('users.id'), nullable=False) # Assuming driver is a User
    amount = Column(Integer, nullable=False) # Or Float, depending on currency needs
    bid_status = Column(String, default='pending') # e.g., pending, accepted, rejected
    created_at = Column(String, server_default=str(datetime.utcnow())) # Using String for simplicity

    load = relationship('Load') # Relationship to the load
    driver = relationship('User') # Relationship to the driver (User)
