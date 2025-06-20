// src/components/driver/BidHistory.js
import React, { useState, useEffect } from 'react';
import './BidHistory.css';
import { fetchDriverBids } from '../../services/driverService';
import { useAuth } from '../../context/AuthContext'; // Assuming useAuth provides user info

const BidHistory = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authUser } = useAuth(); // Assuming authUser has { id: driverId, ... }

  useEffect(() => {
    const fetchBids = async () => {
      if (!authUser || !authUser.id) {
        setError("User ID not found. Cannot fetch bid history.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        console.log(`BidHistory: Fetching bids for driver ID: ${authUser.id}`);
        const data = await fetchDriverBids(authUser.id);
        console.log('BidHistory: Successfully fetched data:', data);
        if (!Array.isArray(data)) {
          console.error('BidHistory: Data is not an array!', data);
          throw new Error('Received invalid data format from server for bids.');
        }
        setBids(data || []);
      } catch (err) {
        console.error('BidHistory: Detailed error fetching bids:', err);
        setError(err.message || 'Failed to fetch bid history. Please check console for details.');
        setBids([]); // Ensure bids is an array on error
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [authUser]); // Re-fetch if authUser changes

  const handleCancelBid = (bidId) => {
    // This is a placeholder. Actual cancellation would involve an API call.
    console.log(`Attempting to cancel bid ID: ${bidId} (UI only)`);
    setBids(prevBids =>
      prevBids.map(bid =>
        bid.id === bidId ? { ...bid, status: 'CANCELLED_BY_USER' } : bid // Changed status to reflect user action
      )
    );
    // TODO: Implement API call to actually cancel the bid on the backend.
  };

  if (loading) return <div className="DBH-loading">Loading your bid history...</div>;
  if (error) return <div className="DBH-error-message">{error}</div>;

  return (
    <div className="DBH-bid-history">
      <h2>My Bid History</h2>
      {!loading && !error && bids.length === 0 ? (
        <p className="DBH-no-bids">You haven't placed any bids yet.</p>
      ) : (
        <div className="DBH-bids-list">
          {bids.map((bid, index) => {
            try {
              if (!bid || typeof bid !== 'object') {
                console.error(`BidHistory: Invalid bid item at index ${index}:`, bid);
                return <div key={index} className="DBH-bid-card error">Invalid bid data</div>;
              }

              const id = bid.id || `missing-id-${index}`;
              const goodsType = bid.goodsType || 'N/A';
              const pickupLocation = bid.pickupLocation || 'N/A';
              const deliveryLocation = bid.deliveryLocation || 'N/A';
              const amount = bid.amount !== undefined ? bid.amount : 'N/A';
              const status = bid.status || 'N/A';
              const bidDateStr = bid.bidDate && !isNaN(new Date(bid.bidDate)) ? new Date(bid.bidDate).toLocaleString() : 'Invalid Date';

              // Determine display status
              let displayStatus = status;
              if (status === 'CANCELLED_BY_USER') {
                displayStatus = 'Cancelled by you';
              } else if (status === 'CANCELLED') {
                // Could be cancelled by system or owner, differentiate if backend provides more info
                displayStatus = 'Cancelled';
              }


              return (
                <div key={id} className={`DBH-bid-card ${status.toLowerCase().replace('_', '-')}`}>
                  <div className="DBH-bid-info">
                    <h3>{goodsType}</h3>
                    <p><strong>Route:</strong> {pickupLocation} → {deliveryLocation}</p>
                    <p><strong>Your Bid:</strong> ₹{amount}</p>
                    <p><strong>Status:</strong>
                      <span className={`DBH-status-badge ${status.toLowerCase().replace('_', '-')}`}>
                        {displayStatus}
                      </span>
                    </p>
                    <p><strong>Date:</strong> {bidDateStr}</p>
                  </div>
                  {status === 'PENDING' && (
                    <button
                      className="DBH-cancel-btn"
                      onClick={() => handleCancelBid(id)}
                    >
                      Cancel Bid
                    </button>
                  )}
                </div>
              );
            } catch (cardError) {
              console.error(`BidHistory: Error rendering bid card for bid at index ${index}:`, bid, cardError);
              return <div key={bid && bid.id ? bid.id : index} className="DBH-bid-card error">Error displaying this bid.</div>;
            }
          })}
        </div>
      )}
    </div>
  );
};

export default BidHistory;