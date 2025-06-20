// src/components/driver/BidHistory.js
import React, { useState, useEffect } from 'react';
import './BidHistory.css';
import { fetchDriverBids } from '../../services/driverService';

const BidHistory = () => {
  const bids = [
    {
      id: 1,
      goodsType: 'Electronics',
      pickupLocation: 'Mumbai',
      deliveryLocation: 'Delhi',
      amount: 15000,
      status: 'PENDING',
      bidDate: '2023-10-15T09:00:00Z'
    },
    {
      id: 2,
      goodsType: 'Furniture',
      pickupLocation: 'Chennai',
      deliveryLocation: 'Bangalore',
      amount: 25000,
      status: 'ACCEPTED',
      bidDate: '2023-10-10T14:30:00Z'
    },
    {
      id: 3,
      goodsType: 'Clothing',
      pickupLocation: 'Kolkata',
      deliveryLocation: 'Hyderabad',
      amount: 18000,
      status: 'REJECTED',
      bidDate: '2023-10-05T11:15:00Z'
    }
  ];

  // In the component:
  // const [bids, setBids] = useState(sampleBids);
  // const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const data = await fetchDriverBids();
        setBids(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching bids:', error);
        setBids([]);
      }
    };

    fetchBids();
  }, []);

  const handleCancelBid = (bidId) => {
    setBids(prevBids =>
      prevBids.map(bid =>
        bid.id === bidId ? { ...bid, status: 'CANCELLED' } : bid
      )
    );
  };

  if (loading) return <div className="DBH-loading">Loading your bids...</div>;

  return (
    <div className="DBH-bid-history">
      <h2>My Bid History</h2>
      {bids.length === 0 ? (
        <p className="DBH-no-bids">You haven't placed any bids yet.</p>
      ) : (
        <div className="DBH-bids-list">
          {bids.map(bid => (
            <div key={bid.id} className={`DBH-bid-card ${bid.status.toLowerCase()}`}>
              <div className="DBH-bid-info">
                <h3>{bid.goodsType}</h3>
                <p><strong>Route:</strong> {bid.pickupLocation} → {bid.deliveryLocation}</p>
                <p><strong>Your Bid:</strong> ₹{bid.amount}</p>
                {/* <p><strong>Status:</strong> <span className={`DBH-status-badge ${bid.status.toLowerCase()}`}>{bid.status}</span></p> */}
                <p><strong>Status:</strong>
                  <span className={`DBH-status-badge ${bid.status.toLowerCase()}`}>
                    {bid.status === 'CANCELLED' ? 'Cancelled by you' : bid.status}
                  </span>
                </p>
                <p><strong>Date:</strong> {new Date(bid.bidDate).toLocaleString()}</p>
              </div>
              {bid.status === 'PENDING' && (
                <button
                  className="DBH-cancel-btn"
                  onClick={() => handleCancelBid(bid.id)}
                >
                  Cancel Bid
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BidHistory;