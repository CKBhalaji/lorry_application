// src/components/driver/DriverProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DriverProfile.css';
import { fetchDriverProfile } from '../../services/driverService';


const DriverProfile = () => {
    // Sample data structure for reference:
    const navigate = useNavigate();
    const [originalProfile, setOriginalProfile] = useState({
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+91 9876543210',
        aadhar: '1234 5678 9012',
        experience: 5,
        rating: 4.5,
        vehicleType: 'Truck',
        vehicleName: 'Ashok Leyland 3718',
        loadCapacity: 3500,
        rcNumber: 'MH01AB1234',
        paymentMethod: 'UPI',
        paymentDetails: 'john.doe@upi'
    });
    // const [profile, setProfile] = useState(null);
    const [profile, setProfile] = useState({ ...originalProfile });
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [errors, setErrors] = useState({});
    

    const validateFields = () => {
        const newErrors = {};
        if (!profile.fullName) newErrors.fullName = 'Full name is required';
        if (!profile.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Invalid email address';
        if (!profile.phone.match(/^[0-9]{10}$/)) newErrors.phone = 'Phone number must be 10 digits';
        if (!profile.aadhar.match(/^[0-9]{12}$/)) newErrors.aadhar = 'Aadhar must be 12 digits';
        if (profile.experience < 0) newErrors.experience = 'Experience cannot be negative';
        if (!profile.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
        if (!profile.vehicleName) newErrors.vehicleName = 'Vehicle name is required';
        if (profile.loadCapacity <= 0) newErrors.loadCapacity = 'Load capacity must be positive';
        if (!profile.rcNumber) newErrors.rcNumber = 'RC number is required';
        if (!profile.paymentMethod) newErrors.paymentMethod = 'Payment method is required';
        if (!profile.paymentDetails) newErrors.paymentDetails = 'Payment details are required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEdit = async () => {
        if (isEditing) {
            if (!validateFields()) return;
            try {
                await saveDriverProfile(profile); // Add this API call
                setOriginalProfile(profile);
            } catch (error) {
                console.error('Error saving profile:', error);
            }
        } else {
            setProfile({ ...originalProfile });
        }
        setIsEditing(!isEditing);
    };

    const handleCancel = () => {
        setProfile({ ...originalProfile });
        setErrors({});
        setIsEditing(false);
    };

    const handleChange = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await fetchDriverProfile();
                setProfile(data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handlePasswordChange_driver = () => {
        navigate('/driver/dashboard?tab=change-password', { state: { activeTab: 'change-password' } });
        // window.location.reload(); // Force immediate refresh
    };

    if (loading) return <div className="DP-loading">Loading profile...</div>;
    if (!profile) return <div className="DP-error">Failed to load profile</div>;

    return (
        <div className="DP-driver-profile">
            <h2>My Profile</h2>

            <div className="DP-profile-section">
                <h3>Personal Information</h3>
                <div className="DP-profile-grid">
                    <div className="DP-profile-field">
                        <label>Full Name</label>
                        {isEditing ? (
                            <>
                                <input
                                    value={profile.fullName}
                                    onChange={e => handleChange('fullName', e.target.value)}
                                />
                                {errors.fullName && <span className="DP-error">{errors.fullName}</span>}
                            </>
                        ) : (
                            <p>{profile.fullName}</p>
                        )}
                        {/* <p>{profile.fullName}</p> */}
                    </div>
                    <div className="DP-profile-field">
                        <label>Email</label>
                        {isEditing ? (
                            <>
                                <input
                                    value={profile.email}
                                    onChange={e => handleChange('email', e.target.value)}
                                />
                                {errors.email && <span className="DP-error">{errors.email}</span>}
                            </>
                        ) : (
                            <p>{profile.email}</p>
                        )}
                        {/* <p>{profile.email}</p> */}
                    </div>
                    <div className="DP-profile-field">
                        <label>Phone</label>
                        {isEditing ? (
                            <>
                                <input
                                    value={profile.phone}
                                    onChange={e => handleChange('phone', e.target.value)}
                                />
                                {errors.phone && <span className="DP-error">{errors.phone}</span>}
                            </>
                        ) : (
                            <p>{profile.phone}</p>
                        )}
                        {/* <p>{profile.phone}</p> */}
                    </div>
                    <div className="DP-profile-field">
                        <label>Aadhar Number</label>
                        {isEditing ? (
                            <>
                                <input
                                    value={profile.aadhar}
                                    onChange={e => handleChange('aadhar', e.target.value)}
                                />
                                {errors.aadhar && <span className="DP-error">{errors.aadhar}</span>}
                            </>
                        ) : (
                            <p>{profile.aadhar}</p>
                        )}
                        {/* <p>{profile.aadhar}</p> */}
                    </div>
                    <div className="DP-profile-field">
                        <label>Experience</label>
                        {isEditing ? (
                            <>
                                <input
                                    value={profile.experience}
                                    onChange={e => handleChange('experience', e.target.value)}
                                />
                                {errors.experience && <span className="DP-error">{errors.experience}</span>}
                            </>
                        ) : (
                            <p>{profile.experience} years</p>
                        )}
                        {/* <p>{profile.experience} years</p> */}
                    </div>
                    <div className="DP-profile-field">
                        <label>Rating</label>
                        <p>{profile.rating || 'Not rated yet'}</p>
                    </div>
                </div>
            </div>

            <div className="DP-profile-section">
                <h3>Vehicle Information</h3>
                <div className="DP-profile-grid">
                    <div className="DP-profile-field">
                        <label>Vehicle Type</label>
                        {isEditing ? (
                            <>
                                <select
                                    value={profile.vehicleType}
                                    onChange={e => handleChange('vehicleType', e.target.value)}
                                >
                                    <option value="Truck">Truck</option>
                                    <option value="Van">Van</option>
                                    <option value="others">Others</option>
                                </select>
                                {errors.vehicleType && <span className="DP-error">{errors.vehicleType}</span>}
                            </>
                        ) : (
                            <p>{profile.vehicleType}</p>
                        )}
                        {/* <p>{profile.vehicleType}</p> */}
                    </div>
                    <div className="DP-profile-field">
                        <label>Vehicle Name</label>
                        {isEditing ? (
                            <>
                                <input
                                    value={profile.vehicleName}
                                    onChange={e => handleChange('vehicleName', e.target.value)}
                                />
                                {errors.vehicleName && <span className="DP-error">{errors.vehicleName}</span>}
                            </>
                        ) : (
                            <p>{profile.vehicleName}</p>
                        )}
                        {/* <p>{profile.vehicleName}</p> */}
                    </div>
                    <div className="DP-profile-field">
                        <label>Load Capacity</label>
                        {isEditing ? (
                            <>
                                <input
                                    value={profile.loadCapacity}
                                    onChange={e => handleChange('loadCapacity', e.target.value)}
                                />
                                {errors.loadCapacity && <span className="DP-error">{errors.loadCapacity}</span>}
                            </>
                        ) : (
                            <p>{profile.loadCapacity} kg</p>
                        )}
                        {/* <p>{profile.loadCapacity} kg</p> */}
                    </div>
                    <div className="DP-profile-field">
                        <label>RC Number</label>
                        {isEditing ? (
                            <>
                                <input
                                    value={profile.rcNumber}
                                    onChange={e => handleChange('rcNumber', e.target.value)}
                                />
                                {errors.rcNumber && <span className="DP-error">{errors.rcNumber}</span>}
                            </>
                        ) : (
                            <p>{profile.rcNumber}</p>
                        )}
                        {/* <p>{profile.rcNumber}</p> */}
                    </div>
                </div>
            </div>

            <div className="DP-profile-section">
                <h3>Payment Information</h3>
                <div className="DP-profile-grid">
                    <div className="DP-profile-field">
                        <label>Primary Payment Method</label>
                        {isEditing ? (
                            <>
                                <select
                                    value={profile.paymentMethod}
                                    onChange={e => handleChange('paymentMethod', e.target.value)}
                                >
                                    <option value="UPI">UPI</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Credit Card">Credit Card</option>
                                </select>
                                {errors.paymentMethod && <span className="DP-error">{errors.paymentMethod}</span>}
                            </>
                        ) : (
                            <p>{profile.paymentMethod}</p>
                        )}
                        {/* <p>{profile.paymentMethod}</p> */}
                    </div>
                    <div className="DP-profile-field">
                        <label>Payment Details</label>
                        {isEditing ? (
                            <>
                                <input
                                    value={profile.paymentDetails}
                                    onChange={e => handleChange('paymentDetails', e.target.value)}
                                />
                                {errors.paymentDetails && <span className="DP-error">{errors.paymentDetails}</span>}
                            </>
                        ) : (
                            <p>{profile.paymentDetails}</p>
                        )}
                        {/* <p>{profile.paymentDetails}</p> */}
                    </div>
                </div>
            </div>

            {/* <button className="DP-edit-btn" onClick={handleEdit}>Edit Profile</button> */}
            <div className="DP-profile-actions">
                <button className="DP-edit-btn" onClick={handleEdit}>
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
                {isEditing && (
                    <button className="DP-cancel-btn" onClick={handleCancel}>
                        Cancel
                    </button>
                )}
            </div>
            <button
                className="AP-change-password-btn"
                onClick={handlePasswordChange_driver}
            >
                Change Password
            </button>
        </div>
    );
};

export default DriverProfile;