// src/components/goods-owner/MyLoads.js
import React, { useState, useEffect } from 'react';
import './MyLoads.css';
import { fetchMyLoads } from '../../services/goodsOwnerService'; // Changed from fetchOwnerLoads

const MyLoads = () => {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchLoads = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMyLoads(); // Changed from fetchOwnerLoads
        setLoads(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching loads:', error);
        setError('Failed to fetch your loads. Please try again later.');
        setLoads([]); // Ensure loads is an array even on error
      } finally {
        setLoading(false);
      }
    };

    fetchLoads();
  }, []);

  if (loading) return <div className="GOML-loading">Loading your loads...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="GOML-my-loads">
      <h2>My Loads</h2>
      {!loading && !error && loads.length === 0 ? (
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