// src/components/goods-owner/MyLoads.js
import React, { useState, useEffect } from 'react';
import './MyLoads.css';
import { fetchMyLoads, fetchBidsForLoad } from '../../services/goodsOwnerService';

const MyLoads = () => {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const [expandedLoadId, setExpandedLoadId] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [bidsError, setBidsError] = useState(null);

  useEffect(() => {
    const fetchLoads = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMyLoads(); // Changed from fetchOwnerLoads
        console.log('MyLoads: Successfully fetched data:', data);
        setLoads(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('MyLoads: Detailed error fetching loads:', error);
        setError(error.message || 'Failed to fetch your loads. Please check console for details.');
        setLoads([]); // Ensure loads is an array even on error
      } finally {
        setLoading(false);
      }
    };

    fetchLoads();
  }, []);

  const handleCardClick = async (loadId) => {
    if (expandedLoadId === loadId) {
      setExpandedLoadId(null);
      setBids([]);
      setBidsError(null);
      return;
    }
    setExpandedLoadId(loadId);
    setBids([]);
    setBidsError(null);
    setBidsLoading(true);
    try {
      const data = await fetchBidsForLoad(loadId);
      setBids(data);
    } catch (err) {
      setBidsError('Failed to fetch bids');
    } finally {
      setBidsLoading(false);
    }
  };

  if (loading) return <div className="GOML-loading">Loading your loads...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="GOML-my-loads">
      <h2>My Loads</h2>
      {!loading && !error && loads.length === 0 ? (
        <p className="GOML-no-loads">You haven't posted any loads yet.</p>
      ) : (
        <div className="GOML-loads-list">
          {loads.map((load, index) => {
            try {
              if (!load || typeof load !== 'object') {
                console.error(`MyLoads: Invalid load item at index ${index}:`, load);
                return <div key={index} className="GOML-load-card error">Invalid load data</div>;
              }
              // Ensure essential properties exist and provide defaults
              const id = load.id || `missing-id-${index}`;
              const goodsType = load.goodsType || 'N/A';
              const status = load.status || 'N/A';
              const pickupLocation = load.pickupLocation || 'N/A';
              const deliveryLocation = load.deliveryLocation || 'N/A';
              const weight = load.weight || 'N/A';
              const pickupDateStr = load.pickupDate && !isNaN(new Date(load.pickupDate)) ? new Date(load.pickupDate).toLocaleDateString() : 'Invalid Date';
              const deliveryDateStr = load.deliveryDate && !isNaN(new Date(load.deliveryDate)) ? new Date(load.deliveryDate).toLocaleDateString() : 'Invalid Date';
              const bidCount = load.bidCount !== undefined ? load.bidCount : 'N/A'; // Handles 0 bids
              const highestBid = load.highestBid; // Can be undefined, handled by conditional rendering

              return (
                <div key={id} className={`GOML-load-card ${status.toLowerCase()}`} onClick={() => handleCardClick(id)} style={{ cursor: 'pointer' }}>
                  <div className="GOML-load-header">
                    <h3>{goodsType}</h3>
                    <span className={`GOML-status-badge ${status.toLowerCase()}`}>{status}</span>
                  </div>
                  <div className="GOML-load-details">
                    <p><strong>Load ID:</strong> {id}</p>
                    <p><strong>From:</strong> {pickupLocation}</p>
                    <p><strong>To:</strong> {deliveryLocation}</p>
                    <p><strong>Weight:</strong> {weight} kg</p>
                    <p><strong>Dates:</strong> {pickupDateStr} - {deliveryDateStr}</p>
                    <p><strong>Bids Received:</strong> {bidCount}</p>
                    {load.acceptedDriverId && (
                      <p><strong>Driver ID:</strong> {load.acceptedDriverId}</p>
                    )}
                    {load.driverId && !load.acceptedDriverId && (
                      <p><strong>Driver ID:</strong> {load.driverId}</p>
                    )}
                    {load.winningBidDriverId && !load.acceptedDriverId && !load.driverId && (
                      <p><strong>Driver ID:</strong> {load.winningBidDriverId}</p>
                    )}
                    {highestBid && ( // This check is fine
                      <p><strong>Highest Bid:</strong> ₹{highestBid}</p>
                    )}
                  </div>
                  <div className="GOML-load-actions">
                    {status === 'ACTIVE' && (
                      <button className="GOML-view-bids-btn">View Bids</button>
                    )}
                    {status === 'ACTIVE' && (
                      <button className="GOML-cancel-btn">Cancel Load</button>
                    )}
                  </div>
                  {expandedLoadId === id && (
                    <div className="GOML-bids-section">
                      {bidsLoading && <p>Loading bids...</p>}
                      {bidsError && <p className="error-message">{bidsError}</p>}
                      {!bidsLoading && !bidsError && (
                        bids.length === 0
                          ? <p>No bids available for your load.</p>
                          : (
                            <ul>
                              {bids.map((bid) => (
                                <li key={bid.id}>
                                  Driver ID: {bid.driver_id}
                                </li>
                              ))}
                            </ul>
                          )
                      )}
                    </div>
                  )}
                </div>
              );
            } catch (cardError) {
              console.error(`MyLoads: Error rendering load card for load at index ${index}:`, load, cardError);
              return <div key={load && load.id ? load.id : index} className="GOML-load-card error">Error displaying this load.</div>;
            }
          })}
        </div>
      )}
    </div>
  );
};

export default MyLoads;