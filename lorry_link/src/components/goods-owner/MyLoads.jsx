// src/components/goods-owner/MyLoads.js
import React, { useState, useEffect } from 'react';
import './MyLoads.css';
import { fetchOwnerLoads } from '../../services/goodsOwnerService';

const MyLoads = () => {
  const loads = [
    {
      id: 1,
      goodsType: 'Electronics',
      pickupLocation: 'Mumbai',
      deliveryLocation: 'Delhi',
      weight: 500,
      pickupDate: '2023-10-20T09:00:00Z',
      deliveryDate: '2023-10-22T18:00:00Z',
      status: 'ACTIVE',
      bidCount: 3,
      highestBid: 15000
    },
    {
      id: 2,
      goodsType: 'Furniture',
      pickupLocation: 'Chennai',
      deliveryLocation: 'Bangalore',
      weight: 800,
      pickupDate: '2023-10-18T11:00:00Z',
      deliveryDate: '2023-10-19T20:00:00Z',
      status: 'COMPLETED',
      bidCount: 5,
      highestBid: 20000
    },
    {
      id: 3,
      goodsType: 'Clothing',
      pickupLocation: 'Kolkata',
      deliveryLocation: 'Hyderabad',
      weight: 300,
      pickupDate: '2023-10-25T08:00:00Z',
      deliveryDate: '2023-10-26T17:00:00Z',
      status: 'CANCELLED',
      bidCount: 0
    }
  ];

  // In the component:
  // const [loads, setLoads] = useState(sampleLoads);
  // const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchLoads = async () => {
      try {
        const data = await fetchOwnerLoads();
        setLoads(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching loads:', error);
        setLoads([]);
      }
    };

    fetchLoads();
  }, []);

  if (loading) return <div className="GOML-loading">Loading your loads...</div>;

  return (
    <div className="GOML-my-loads">
      <h2>My Loads</h2>
      {loads.length === 0 ? (
        <p className="GOML-no-loads">You haven't posted any loads yet.</p>
      ) : (
        <div className="GOML-loads-list">
          {loads.map(load => (
            <div key={load.id} className={`GOML-load-card ${load.status.toLowerCase()}`}>
              <div className="GOML-load-header">
                <h3>{load.goodsType}</h3>
                <span className={`GOML-status-badge ${load.status.toLowerCase()}`}>{load.status}</span>
              </div>
              <div className="GOML-load-details">
                <p><strong>From:</strong> {load.pickupLocation}</p>
                <p><strong>To:</strong> {load.deliveryLocation}</p>
                <p><strong>Weight:</strong> {load.weight} kg</p>
                <p><strong>Dates:</strong> {new Date(load.pickupDate).toLocaleDateString()} - {new Date(load.deliveryDate).toLocaleDateString()}</p>
                <p><strong>Bids Received:</strong> {load.bidCount}</p>
                {load.highestBid && (
                  <p><strong>Highest Bid:</strong> ₹{load.highestBid}</p>
                )}
              </div>
              <div className="GOML-load-actions">
                {load.status === 'ACTIVE' && (
                  <button className="GOML-view-bids-btn">View Bids</button>
                )}
                {load.status === 'ACTIVE' && (
                  <button className="GOML-cancel-btn">Cancel Load</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLoads;