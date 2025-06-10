// src/components/driver/AvailableLoads.js
import React, { useState, useEffect } from 'react';
import './AvailableLoads.css';
import { fetchAvailableLoads, placeBid } from '../../services/driverService';

const AvailableLoads = () => {
  const sampleLoads = [
    {
      id: 1,
      goodsType: 'Electronics',
      pickupLocation: 'Mumbai',
      deliveryLocation: 'Delhi',
      weight: 500,
      pickupDate: '2023-10-20T09:00:00Z',
      deliveryDate: '2023-10-22T18:00:00Z',
      currentHighestBid: 15000
    },
    {
      id: 2,
      goodsType: 'Furniture',
      pickupLocation: 'Chennai',
      deliveryLocation: 'Bangalore',
      weight: 800,
      pickupDate: '2023-10-18T11:00:00Z',
      deliveryDate: '2023-10-19T20:00:00Z',
      currentHighestBid: 20000
    },
    {
      id: 3,
      goodsType: 'Clothing',
      pickupLocation: 'Kolkata',
      deliveryLocation: 'Hyderabad',
      weight: 300,
      pickupDate: '2023-10-25T08:00:00Z',
      deliveryDate: '2023-10-26T17:00:00Z',
      currentHighestBid: 12000
    }
  ];

  // In the component:
  const [loads, setLoads] = useState(sampleLoads);
  // const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmounts, setBidAmounts] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const getLoads = async () => {
      try {
        const data = await fetchAvailableLoads();
        setLoads(data);
        // Initialize bid amounts
        const initialBids = {};
        data.forEach(load => {
          initialBids[load.id] = '';
        });
        setBidAmounts(initialBids);
      } catch (error) {
        console.error('Error fetching loads:', error);
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
  
    try {
      await placeBid(loadId, parseFloat(amount));
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

  if (loading) return <div>Loading available loads...</div>;

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
      {loads.length === 0 ? (
        <p>No loads available at the moment.</p>
      ) : (
        <div className="DAL-loads-list">
          {loads.map(load => (
            <div key={load.id} className="DAL-load-card">
              <div className="DAL-load-info">
                <h3>{load.goodsType}</h3>
                <p><strong>From:</strong> {load.pickupLocation}</p>
                <p><strong>To:</strong> {load.deliveryLocation}</p>
                <p><strong>Weight:</strong> {load.weight} kg</p>
                <p><strong>Pickup Date:</strong> {new Date(load.pickupDate).toLocaleDateString()}</p>
                <p><strong>Delivery Date:</strong> {new Date(load.deliveryDate).toLocaleDateString()}</p>
                <p><strong>Current Highest Bid:</strong> ₹{load.currentHighestBid || 'No bids yet'}</p>
              </div>

              <div className="DAL-bid-section">
                <input
                  type="number"
                  placeholder="Enter your bid amount"
                  value={bidAmounts[load.id]}
                  onChange={(e) => handleBidChange(load.id, e.target.value)}
                />
                <button onClick={() => handleSubmitBid(load.id)}>
                  Place Bid
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableLoads;