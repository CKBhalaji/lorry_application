// src/components/driver/BidHistory.js
import React, { useState, useEffect } from 'react';
import './BidHistory.css';
import { fetchDriverBids } from '../../services/driverService';
import { useAuth } from '../../context/AuthContext'; // Assuming useAuth provides user info
import { fetchOwnerPublicProfile } from '../../services/goodsOwnerService';

const BidHistory = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBidId, setExpandedBidId] = useState(null);
  const [showOwnerDetails, setShowOwnerDetails] = useState({});
  const [ownerDetails, setOwnerDetails] = useState({});
  const { authUser } = useAuth(); // Assuming authUser has { id: driverId, ... }
  // Remove this incorrect line. ownerId should be set per bid, not for all bids.

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

  // Filter to only the latest bid per load_id
  const latestBidsMap = {};
  bids.forEach(bid => {
    if (!latestBidsMap[bid.load_id]) {
      latestBidsMap[bid.load_id] = bid;
    }
  });
  const latestBids = Object.values(latestBidsMap);

  return (
    <div className="DBH-bid-history">
      <h2>My Bid History</h2>
      {!loading && !error && latestBids.length === 0 ? (
        <p className="DBH-no-bids">You haven't placed any bids yet.</p>
      ) : (
        <div className="DBH-bids-list">
          {latestBids.map((bid, index) => {
            const isValid = bid && typeof bid === 'object';
            const ownerId = bid.owner_id;
            const id = isValid && bid.id ? bid.id : `missing-id-${index}`;
            const goodsType = isValid && bid.goodsType ? bid.goodsType : 'N/A';
            const pickupLocation = isValid && bid.pickupLocation ? bid.pickupLocation : 'N/A';
            const deliveryLocation = isValid && bid.deliveryLocation ? bid.deliveryLocation : 'N/A';
            const amount = isValid && bid.amount !== undefined ? bid.amount : 'N/A';
            const status = isValid && bid.bid_status ? bid.bid_status : 'N/A';
            const bidDateStr = isValid && bid.created_at && !isNaN(new Date(bid.created_at)) ? new Date(bid.created_at).toLocaleString() : 'Invalid Date';

            // Determine display status
            let displayStatus = status;
            if (status === 'CANCELLED_BY_USER') {
              displayStatus = 'Cancelled by you';
            } else if (status === 'CANCELLED') {
              displayStatus = 'Cancelled';
            }

            return (
              <div
                key={id}
                className={`DBH-bid-card ${status.toLowerCase().replace('_', ' ')}
                      {bid.owner_id && (
                        <OwnerDetailsSection ownerId={bid.owner_id} />
                      )}${expandedBidId === id ? ' DBH-bid-card-expanded' : ''}`}
                onClick={() => setExpandedBidId(expandedBidId === id ? null : id)}
                style={{ cursor: 'pointer', boxShadow: expandedBidId === id ? '0 0 0 2px var(--input-focus)' : undefined, background: expandedBidId === id ? 'var(--input-inside)' : undefined, transition: 'box-shadow 0.2s, background 0.2s' }}
              >
                <div className="DBH-bid-info">
                  <h3>{goodsType}</h3>
                  <p><strong>Load ID:</strong> {bid.load_id || 'N/A'}</p>
                  <p><strong>Route:</strong> {pickupLocation} → {deliveryLocation}</p>
                  <p><strong>Your Bid:</strong> ₹{amount}</p>
                  <p><strong>Status:</strong>
                    <span className={`DBH-status-badge ${status.toLowerCase().replace('_', '-')}`}>
                      {displayStatus}
                    </span>
                  </p>
                  <p><strong>Date:</strong> {bidDateStr}</p>
                </div>
                {expandedBidId === id && (
                  <>
                    {/* <div style={{ margin: '10px 0', color: 'var(--input-focus)', fontWeight: 500 }}>
                      Actions available below (status: {status})
                    </div> */}
                    {status === 'PENDING' && (
                      <button
                        className="DBH-cancel-btn"
                        onClick={e => { e.stopPropagation(); handleCancelBid(id); }}
                      >
                        Cancel Bid
                      </button>
                    )}
                    {(status === 'AWAITING_DRIVER_RESPONSE' || (bid.load_status === 'active' && Number(bid.load_accepted_driver_id) === Number(authUser?.id))) &&
                      status !== 'ACCEPTED' && status !== 'DECLINED' && (
                        <div style={{ marginTop: '10px' }}>
                          <button
                            className="DBH-accept-btn"
                            style={{ background: 'green', color: 'white', marginRight: '10px', padding: '6px 16px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={async e => {
                              e.stopPropagation();
                              try {
                                const { acceptBid, fetchDriverBids } = await import('../../services/driverService');
                                await acceptBid(id);
                                // Refresh bids
                                const data = await fetchDriverBids(authUser.id);
                                setBids(data || []);
                              } catch (err) {
                                alert('Failed to accept bid.');
                              }
                            }}
                          >Accept</button>
                          <button
                            className="DBH-decline-btn"
                            style={{ background: 'red', color: 'white', padding: '6px 16px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={async e => {
                              e.stopPropagation();
                              try {
                                const { declineBid, fetchDriverBids } = await import('../../services/driverService');
                                await declineBid(id);
                                // Refresh bids
                                const data = await fetchDriverBids(authUser.id);
                                setBids(data || []);
                              } catch (err) {
                                alert('Failed to decline bid.');
                              }
                            }}
                          >Decline</button>
                        </div>
                      )}
                    {ownerId !== undefined && ownerId !== null && (
                      <>
                        {/* Fetch owner details on expand if not already fetched */}
                        {showOwnerDetails[bid.load_id] === undefined && handleToggleOwnerDetails && handleToggleOwnerDetails(bid.load_id, ownerId)}
                        <div className="DAL-owner-details">
                          {ownerDetails[bid.load_id] ? (
                            ownerDetails[bid.load_id].error ? (
                              <p>{ownerDetails[bid.load_id].error}</p>
                            ) : (
                              <>
                                <h4>Owner Details</h4>
                                <p><strong>Id:</strong> {ownerId || 'N/A'}</p>
                                <p><strong>Username:</strong> {ownerDetails[bid.load_id].username || 'N/A'}</p>
                                <p><strong>Email:</strong> {ownerDetails[bid.load_id].email || 'N/A'}</p>
                                <p><strong>Phone Number:</strong> {ownerDetails[bid.load_id].phone_number || 'N/A'}</p>
                              </>
                            )
                          ) : (
                            <p>Loading owner details...</p>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BidHistory;