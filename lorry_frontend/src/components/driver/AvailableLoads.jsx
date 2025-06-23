// src/components/driver/AvailableLoads.js
import React, { useState, useEffect } from 'react';
import './AvailableLoads.css';
import { fetchAvailableLoads, placeBid } from '../../services/driverService';
import { fetchOwnerPublicProfile } from '../../services/goodsOwnerService';

const AvailableLoads = () => {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidAmounts, setBidAmounts] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [ownerDetails, setOwnerDetails] = useState({}); // { [loadId]: ownerData }
  const [showOwnerDetails, setShowOwnerDetails] = useState({}); // { [loadId]: boolean }

  useEffect(() => {
    const getLoads = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAvailableLoads();
        console.log('AvailableLoads: Successfully fetched data:', data);
        if (!Array.isArray(data)) {
          console.error('AvailableLoads: Data is not an array!', data);
          throw new Error('Received invalid data format from server.');
        }
        setLoads(data || []); // Ensure loads is always an array
        // Initialize bid amounts
        const initialBids = {};
        if (data) { // Check if data is not null before calling forEach
          data.forEach(load => {
            if (load && load.id) { // Ensure load and load.id are valid
              initialBids[load.id] = '';
            }
          });
        }
        setBidAmounts(initialBids);
      } catch (error) {
        console.error('AvailableLoads: Detailed error fetching loads:', error);
        setError(error.message || 'Failed to fetch available loads. Please check console for details.');
      } finally {
        setLoading(false);
      }
    };

    getLoads();
  }, []);

  const handleBidChange = (loadId, amount) => {
    setBidAmounts(prev => ({
      ...prev,
      [loadId]: amount
    }));
  };

  // const handleSubmitBid = async (loadId) => {
  //   const amount = bidAmounts[loadId];
  //   if (!amount || isNaN(amount)) {
  //     alert('Please enter a valid bid amount');
  //     return;
  //   }

  //   try {
  //     await placeBid(loadId, parseFloat(amount));
  //     alert('Bid placed successfully!');
  //     // Refresh the loads list
  //     const updatedLoads = await fetchAvailableLoads();
  //     setLoads(updatedLoads);
  //   } catch (error) {
  //     console.error('Error placing bid:', error);
  //     alert('Failed to place bid. Please try again.');
  //   }
  // };

  const handleSubmitBid = async (loadId) => {
    const amount = bidAmounts[loadId];
    if (!amount || isNaN(amount)) {
      setSuccessMessage({ type: 'error', message: 'Please enter a valid bid amount' });
      return;
    }

    // Get driver ID from localStorage
    const raw = localStorage.getItem('authUser');
    const authUser = raw ? JSON.parse(raw) : null;
    if (!authUser || !authUser.id) {
      setSuccessMessage({ type: 'error', message: 'User not found or not logged in' });
      return;
    }

    try {
      await placeBid({
        load_id: loadId,
        amount: parseFloat(amount),
        driver_id: authUser.id
      });
      setSuccessMessage({ 
        type: 'success', 
        message: 'Bid placed successfully!',
        amount: amount,
        loadId: loadId
      });
      const updatedLoads = await fetchAvailableLoads();
      setLoads(updatedLoads);
      setTimeout(() => setSuccessMessage(null), 3000); // Auto-hide after 3 seconds
    } catch (error) {
      setSuccessMessage({ type: 'error', message: 'Failed to place bid. Please try again.' });
      console.error('Error placing bid:', error);
    }
  };

  const handleToggleOwnerDetails = async (loadId, ownerId) => {
    setShowOwnerDetails(prev => ({
      ...prev,
      [loadId]: !prev[loadId]
    }));
    // Only fetch if not already fetched and toggling on
    if (!ownerDetails[loadId] && !showOwnerDetails[loadId]) {
      try {
        const owner = await fetchOwnerPublicProfile(ownerId);
        setOwnerDetails(prev => ({ ...prev, [loadId]: owner }));
      } catch (err) {
        setOwnerDetails(prev => ({ ...prev, [loadId]: { error: 'Failed to fetch owner details.' } }));
      }
    }
  };

  if (loading) return <div>Loading available loads...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const successCard = successMessage && (
    <div className={`DAL-success-card ${successMessage.type}`}>
      <h3>{successMessage.message}</h3>
      {successMessage.type === 'success' && (
        <p>Bid Amount: ₹{successMessage.amount}</p>
      )}
      <button
        className="DAL-ok-button"
        onClick={() => setSuccessMessage(null)}
      >
        OK
      </button>
    </div>
  );

  return (
    <div className="DAL-available-loads">
      {successCard}
      <h2>Available Loads</h2>
      {/* Owner modal removed, now shown inline in card */}
      {!loading && !error && loads.length === 0 ? (
        <p>No loads available at the moment.</p>
      ) : (
        <div className="DAL-loads-list">
          {loads.map((load, index) => {
            try {
              if (!load || typeof load !== 'object') {
                console.error(`AvailableLoads: Invalid load item at index ${index}:`, load);
                return <div key={index} className="DAL-load-card error">Invalid load data</div>;
              }
              // Ensure essential properties exist
              const id = load.id || `missing-id-${index}`;
              const goodsType = load.goodsType || 'N/A';
              const pickupLocation = load.pickupLocation || 'N/A';
              const deliveryLocation = load.deliveryLocation || 'N/A';
              const weight = load.weight || 'N/A';
              // Validate dates before formatting
              const pickupDateStr = load.pickupDate && !isNaN(new Date(load.pickupDate)) ? new Date(load.pickupDate).toLocaleDateString() : 'Invalid Date';
              const deliveryDateStr = load.deliveryDate && !isNaN(new Date(load.deliveryDate)) ? new Date(load.deliveryDate).toLocaleDateString() : 'Invalid Date';
              const currentHighestBid = load.current_highest_bid || 'No bids yet';

              return (
                <div key={id} className="DAL-load-card" onClick={() => handleToggleOwnerDetails(id, load.owner_id)} style={{ cursor: 'pointer' }}>
                  <div className="DAL-load-info">
                    <h3>{goodsType}</h3>
                    <p><strong>From:</strong> {pickupLocation}</p>
                    <p><strong>To:</strong> {deliveryLocation}</p>
                    <p><strong>Weight:</strong> {weight} kg</p>
                    <p><strong>Pickup Date:</strong> {pickupDateStr}</p>
                    <p><strong>Delivery Date:</strong> {deliveryDateStr}</p>
                    <p><strong>Current Highest Bid:</strong> ₹{currentHighestBid}</p>
                  </div>
                  {/* Bid section remains the same */}
                  <div className="DAL-bid-section" onClick={e => e.stopPropagation()}>
                    <input
                      type="number"
                      placeholder="Enter your bid amount"
                      value={bidAmounts[load.id] || ''} // Ensure bidAmounts[load.id] is not undefined
                      onChange={(e) => handleBidChange(load.id, e.target.value)}
                    />
                    <button onClick={() => handleSubmitBid(load.id)}>
                      Place Bid
                    </button>
                  </div>
                  {showOwnerDetails[load.id] && (
                    <div className="DAL-owner-details">
                      {ownerDetails[load.id] ? (
                        ownerDetails[load.id].error ? (
                          <p>{ownerDetails[load.id].error}</p>
                        ) : (
                          <>
                            <h4>Owner Details</h4>
                            <p><strong>Id:</strong> {ownerDetails[load.id].owner_id || 'N/A'}</p>
                            <p><strong>Username:</strong> {ownerDetails[load.id].username || 'N/A'}</p>
                            <p><strong>Email:</strong> {ownerDetails[load.id].email || 'N/A'}</p>
                            <p><strong>Phone Number:</strong> {ownerDetails[load.id].phone_number || 'N/A'}</p>
                          </>
                        )
                      ) : (
                        <p>Loading owner details...</p>
                      )}
                    </div>
                  )}
                </div>
              );
            } catch (cardError) {
              console.error(`AvailableLoads: Error rendering load card for load at index ${index}:`, load, cardError);
              return <div key={load && load.id ? load.id : index} className="DAL-load-card error">Error displaying this load.</div>;
            }
          })}
        </div>
      )}
    </div>
  );
};

export default AvailableLoads;