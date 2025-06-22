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

class DriverProfile(Base):
    __tablename__ = 'driver_profiles'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    phone_number = Column(String, nullable=True)
    aadhar_number = Column(String, nullable=True)
    experience = Column(String, nullable=True)
    driving_license_filename = Column(String, nullable=True)
    insurance_filename = Column(String, nullable=True)
    rc_card_filename = Column(String, nullable=True)
    vehicle_type = Column(String, nullable=True)
    custom_vehicle_type = Column(String, nullable=True)
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
    phone_number = Column(String, nullable=True)

    user = relationship('User', back_populates='goods_owner_profile')

class Load(Base):
    __tablename__ = 'loads'

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    goodsType = Column(String, nullable=False)
    weight = Column(Integer, nullable=False)
    pickupLocation = Column(String, nullable=False)
    deliveryLocation = Column(String, nullable=False)
    pickupDate = Column(String, nullable=False)
    deliveryDate = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    expectedPrice = Column(Integer, nullable=True)
    status = Column(String, default='pending')
    posted_date = Column(String, server_default=str(datetime.utcnow()))
    current_highest_bid = Column(Integer, nullable=True)

    owner = relationship('User')

class Bid(Base):
    __tablename__ = 'bids'

    id = Column(Integer, primary_key=True, index=True)
    load_id = Column(Integer, ForeignKey('loads.id'), nullable=False)
    driver_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    amount = Column(Integer, nullable=False)
    bid_status = Column(String, default='pending')
    created_at = Column(String, server_default=str(datetime.utcnow()))

    load = relationship('Load')
    driver = relationship('User')

class Dispute(Base):
    __tablename__ = 'disputes'

    id = Column(Integer, primary_key=True, index=True)
    driverId = Column(Integer, ForeignKey('users.id'), nullable=True)
    loadId = Column(Integer, ForeignKey('loads.id'), nullable=True)
    disputeType = Column(String, nullable=True)
    message = Column(Text, nullable=False)
    attachments = Column(String, nullable=True)
    status = Column(String, default='open')
    resolution_details = Column(Text, nullable=True)
    created_at = Column(String, server_default=str(datetime.utcnow()))
