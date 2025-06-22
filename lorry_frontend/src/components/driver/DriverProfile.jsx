// src/components/driver/DriverProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DriverProfile.css';
import { fetchDriverProfile } from '../../services/driverService'; // Removed saveDriverProfile as it's not defined here
import { useAuth } from '../../context/AuthContext'; // For authUser

const DriverProfile = () => {
    const navigate = useNavigate();
    const { authUser } = useAuth();

    const [originalProfile, setOriginalProfile] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const loadProfile = async () => {
            if (!authUser || !authUser.id) {
                setError("User ID not found. Cannot fetch profile.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                console.log(`DriverProfile: Fetching profile for driver ID: ${authUser.id}`);
                const data = await fetchDriverProfile(authUser.id);
                console.log('DriverProfile: Successfully fetched data:', data);

                if (data && typeof data === 'object') {
                    setOriginalProfile(data);
                    setProfile(data);
                } else {
                    console.error('DriverProfile: Data is not an object or is null!', data);
                    throw new Error('Received invalid data format from server for profile.');
                }
            } catch (err) {
                console.error('DriverProfile: Detailed error fetching profile:', err);
                setError(err.message || 'Failed to fetch profile. Please check console for details.');
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [authUser]);

    const validateFields = () => {
        const newErrors = {};
        if (!profile?.fullName) newErrors.fullName = 'Full name is required';
        if (!profile?.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Invalid email address';
        // Add other validations as needed, using optional chaining (profile?.property)
        if (!profile?.phone?.match(/^[0-9]{10}$/)) newErrors.phone = 'Phone number must be 10 digits';
        if (!profile?.aadhar?.match(/^[0-9]{12}$/)) newErrors.aadhar = 'Aadhar must be 12 digits';
        if (profile?.experience < 0) newErrors.experience = 'Experience cannot be negative';
        if (!profile?.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
        if (!profile?.vehicleName) newErrors.vehicleName = 'Vehicle name is required';
        if (profile?.loadCapacity <= 0) newErrors.loadCapacity = 'Load capacity must be positive';
        if (!profile?.rcNumber) newErrors.rcNumber = 'RC number is required';
        if (!profile?.paymentMethod) newErrors.paymentMethod = 'Payment method is required';
        if (!profile?.paymentDetails) newErrors.paymentDetails = 'Payment details are required';


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEdit = async () => {
        if (isEditing) {
            if (!validateFields()) return;
            try {
                // Placeholder for save profile functionality
                console.log('DriverProfile: Attempting to save profile (API call not implemented yet):', profile);
                // await saveDriverProfile(profile); // This function needs to be imported and implemented
                setOriginalProfile(profile); // Optimistically update originalProfile
                alert('Profile changes would be saved here. API call needs implementation.');
                setIsEditing(false); // Exit editing mode on successful save
            } catch (saveError) {
                console.error('Error saving profile:', saveError);
                setError(saveError.message || 'Failed to save profile.'); // Show save error
            }
        } else {
            // Entering editing mode, ensure 'profile' has data from 'originalProfile'
             if (originalProfile) {
                setProfile({ ...originalProfile });
            }
            setIsEditing(true);
        }
    };

    const handleCancel = () => {
        if (originalProfile) {
            setProfile({ ...originalProfile });
        }
        setErrors({});
        setIsEditing(false);
    };

    const handleChange = (field, value) => {
        setProfile(prev => (prev ? { ...prev, [field]: value } : { [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handlePasswordChange_driver = () => {
        navigate('/driver/dashboard?tab=change-password', { state: { activeTab: 'change-password' } });
    };

    if (loading) return <div className="DP-loading">Loading profile...</div>;
    if (error) return <div className="DP-error-message">{error}</div>; // Changed class for consistency
    if (!profile) return <div className="DP-no-profile">No profile data available.</div>; // Handles case where profile is null after loading

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
                                    value={profile?.fullName || ''}
                                    onChange={e => handleChange('fullName', e.target.value)}
                                />
                                {errors.fullName && <span className="DP-error">{errors.fullName}</span>}
                            </>
                        ) : (
                            <p>{profile?.fullName || 'N/A'}</p>
                        )}
                    </div>
                    <div className="DP-profile-field">
                        <label>Email</label>
                        {isEditing ? (
                            <>
                                <input
                                    value={profile?.email || ''}
                                    onChange={e => handleChange('email', e.target.value)}
                                />
                                {errors.email && <span className="DP-error">{errors.email}</span>}
                            </>
                        ) : (
                            <p>{profile?.email || 'N/A'}</p>
                        )}
                    </div>
                    <div className="DP-profile-field">
                        <label>Phone</label>
                        {isEditing ? (
                            <>
                                <input
                                    value={profile?.phone || ''}
                                    onChange={e => handleChange('phone', e.target.value)}
                                />
                                {errors.phone && <span className="DP-error">{errors.phone}</span>}
                            </>
                        ) : (
                            <p>{profile?.phone || 'N/A'}</p>
                        )}
                    </div>
                    <div className="DP-profile-field">
                        <label>Aadhar Number</label>
                        {isEditing ? (
                            <>
                                <input
                                    value={profile?.aadhar || ''}
                                    onChange={e => handleChange('aadhar', e.target.value)}
                                />
                                {errors.aadhar && <span className="DP-error">{errors.aadhar}</span>}
                            </>
                        ) : (
                            <p>{profile?.aadhar || 'N/A'}</p>
                        )}
                    </div>
                    <div className="DP-profile-field">
                        <label>Experience</label>
                        {isEditing ? (
                            <>
                                <input
                                    type="number"
                                    value={profile?.experience || 0}
                                    onChange={e => handleChange('experience', parseInt(e.target.value, 10))}
                                />
                                {errors.experience && <span className="DP-error">{errors.experience}</span>}
                            </>
                        ) : (
                            <p>{profile?.experience !== undefined ? `${profile.experience} years` : 'N/A'}</p>
                        )}
                    </div>
                    <div className="DP-profile-field">
                        <label>Rating</label>
                        <p>{profile?.rating || 'Not rated yet'}</p>
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
                                    value={profile?.vehicleType || ''}
                                    onChange={e => handleChange('vehicleType', e.target.value)}
                                >
                                    <option value="">Select Type</option>
                                    <option value="Truck">Truck</option>
                                    <option value="Van">Van</option>
                                    <option value="others">Others</option>
                                </select>
                                {errors.vehicleType && <span className="DP-error">{errors.vehicleType}</span>}
                            </>
                        ) : (
                            <p>{profile?.vehicleType || 'N/A'}</p>
                        )}
                    </div>
                    <div className="DP-profile-field">
                        <label>Vehicle Name</label>
                        {isEditing ? (
                            <>
                                <input
                                    value={profile?.vehicleName || ''}
                                    onChange={e => handleChange('vehicleName', e.target.value)}
                                />
                                {errors.vehicleName && <span className="DP-error">{errors.vehicleName}</span>}
                            </>
                        ) : (
                            <p>{profile?.vehicleName || 'N/A'}</p>
                        )}
                    </div>
                    <div className="DP-profile-field">
                        <label>Load Capacity (kg)</label>
                        {isEditing ? (
                            <>
                                <input
                                    type="number"
                                    value={profile?.loadCapacity || 0}
                                    onChange={e => handleChange('loadCapacity', parseInt(e.target.value, 10))}
                                />
                                {errors.loadCapacity && <span className="DP-error">{errors.loadCapacity}</span>}
                            </>
                        ) : (
                            <p>{profile?.loadCapacity !== undefined ? `${profile.loadCapacity} kg` : 'N/A'}</p>
                        )}
                    </div>
                    <div className="DP-profile-field">
                        <label>RC Number</label>
                        {isEditing ? (
                            <>
                                <input
                                    value={profile?.rcNumber || ''}
                                    onChange={e => handleChange('rcNumber', e.target.value)}
                                />
                                {errors.rcNumber && <span className="DP-error">{errors.rcNumber}</span>}
                            </>
                        ) : (
                            <p>{profile?.rcNumber || 'N/A'}</p>
                        )}
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
                                    value={profile?.paymentMethod || ''}
                                    onChange={e => handleChange('paymentMethod', e.target.value)}
                                >
                                    <option value="">Select Method</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Credit Card">Credit Card</option>
                                </select>
                                {errors.paymentMethod && <span className="DP-error">{errors.paymentMethod}</span>}
                            </>
                        ) : (
                            <p>{profile?.paymentMethod || 'N/A'}</p>
                        )}
                    </div>
                    <div className="DP-profile-field">
                        <label>Payment Details</label>
                        {isEditing ? (
                            <>
                                <input
                                    value={profile?.paymentDetails || ''}
                                    onChange={e => handleChange('paymentDetails', e.target.value)}
                                />
                                {errors.paymentDetails && <span className="DP-error">{errors.paymentDetails}</span>}
                            </>
                        ) : (
                            <p>{profile?.paymentDetails || 'N/A'}</p>
                        )}
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