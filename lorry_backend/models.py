from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SQLAlchemyEnum, Text, Boolean
from sqlalchemy.orm import relationship
from .database import Base
import enum

class UserRole(str, enum.Enum):
    SUPERADMIN = 'superadmin'
    ADMIN = 'admin'
    MANAGER = 'manager'
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

    driver_profile = relationship('DriverProfile', back_populates='user', uselist=False, cascade="all, delete-orphan")
    goods_owner_profile = relationship('GoodsOwnerProfile', back_populates='user', uselist=False, cascade="all, delete-orphan")
    admin_profile = relationship('AdminProfile', back_populates='user', uselist=False, cascade="all, delete-orphan")

class AdminProfile(Base):
    __tablename__ = 'admin_profiles'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete="CASCADE"), unique=True, nullable=False)
    name = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)

    user = relationship('User', back_populates='admin_profile')

class DriverProfile(Base):
    __tablename__ = 'driver_profiles'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String, nullable=True)
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
    user_id = Column(Integer, ForeignKey('users.id', ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    gst_number = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)

    user = relationship('User', back_populates='goods_owner_profile')

class Load(Base):
    __tablename__ = 'loads'

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
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
    current_lowest_bid = Column(Integer, nullable=True)
    accepted_driver_id = Column(Integer, ForeignKey('users.id', ondelete="CASCADE"), nullable=True)

    owner = relationship('User', foreign_keys=[owner_id])
    accepted_driver = relationship('User', foreign_keys=[accepted_driver_id])

class Bid(Base):
    __tablename__ = 'bids'

    id = Column(Integer, primary_key=True, index=True)
    load_id = Column(Integer, ForeignKey('loads.id', ondelete="CASCADE"), nullable=False)
    driver_id = Column(Integer, ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    amount = Column(Integer, nullable=False)
    bid_status = Column(String, default='pending')
    created_at = Column(String, server_default=str(datetime.utcnow()))

    load = relationship('Load')
    driver = relationship('User')

class Dispute(Base):
    __tablename__ = 'disputes'

    id = Column(Integer, primary_key=True, index=True)
    driverId = Column(Integer, ForeignKey('users.id', ondelete="CASCADE"), nullable=True)
    loadId = Column(Integer, ForeignKey('loads.id', ondelete="CASCADE"), nullable=True)
    disputeType = Column(String, nullable=True)
    message = Column(Text, nullable=False)
    attachments = Column(String, nullable=True)
    status = Column(String, default='open')
    resolution_details = Column(Text, nullable=True)
    created_at = Column(String, server_default=str(datetime.utcnow()))
