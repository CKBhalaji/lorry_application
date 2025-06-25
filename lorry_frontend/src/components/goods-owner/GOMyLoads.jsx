// src/components/goods-owner/MyLoads.js
import React, { useState, useEffect } from 'react';
import './GOMyLoads.css';
import { fetchMyLoads, fetchBidsForLoad, hireDriverForLoad} from '../../services/goodsOwnerService';

const MyLoads = () => {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLoadId, setExpandedLoadId] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [bidsError, setBidsError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    const fetchLoads = async () => {
      setLoading(true);
      setError(null);
      let statusParam = null;
      if (activeTab === 'active') statusParam = 'active';
      else if (activeTab === 'delivered') statusParam = 'delivered';
      else if (activeTab === 'cancelled') statusParam = 'cancelled';
      try {
        const data = await fetchMyLoads(statusParam);
        setLoads(Array.isArray(data) ? data : []);
      } catch (error) {
        setError(error.message || 'Failed to fetch your loads. Please check console for details.');
        setLoads([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLoads();
  }, [activeTab]);

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

  // Tab filters
  const activeLoads = loads.filter(load =>
    ['active', 'assigned', 'pending', 'awaiting_driver_response','in_transit'].includes((load.status || '').toLowerCase())
  );
  const deliveredLoads = loads.filter(load => ['delivered', 'completed'].includes((load.status || '').toLowerCase()));
  const cancelledLoads = loads.filter(load => ['cancelled', 'declined'].includes((load.status || '').toLowerCase()));

  const getLoadsForTab = () => {
    if (activeTab === 'active') return activeLoads;
    if (activeTab === 'delivered') return deliveredLoads;
    if (activeTab === 'cancelled') return cancelledLoads;
    return [];
  };

  if (loading) return <div className="GOML-loading">Loading your loads...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="GOML-my-loads">
      <div className="GOML-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>My Loads</h2>
        <div className="GOML-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button
            className={activeTab === 'active' ? 'active' : ''}
            onClick={() => setActiveTab('active')}
          >
            Active/Pending
          </button>
          <button
            className={activeTab === 'delivered' ? 'active' : ''}
            onClick={() => setActiveTab('delivered')}
          >
            Delivered
          </button>
          <button
            className={activeTab === 'cancelled' ? 'active' : ''}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled
          </button>
        </div>
      </div>
      {!loading && !error && getLoadsForTab().length === 0 ? (
        <p className="GOML-no-loads">No loads in this category.</p>
      ) : (
        <div className="GOML-loads-list">
          {getLoadsForTab().map((load, index) => {
            try {
              if (!load || typeof load !== 'object') {
                return <div key={index} className="GOML-load-card error">Invalid load data</div>;
              }
              // DEBUG: Log the load status for each load
              console.log(`Load ID: ${load.id}, Status: ${load.status}`);
              const id = load.id !== undefined ? load.id : index;
              const goodsType = load.goodsType || 'N/A';
              const status = load.status || 'N/A';
              const pickupLocation = load.pickupLocation || 'N/A';
              const deliveryLocation = load.deliveryLocation || 'N/A';
              const weight = load.weight || 'N/A';
              const pickupDateStr = load.pickupDate && !isNaN(new Date(load.pickupDate)) ? new Date(load.pickupDate).toLocaleDateString() : 'Invalid Date';
              const deliveryDateStr = load.deliveryDate && !isNaN(new Date(load.deliveryDate)) ? new Date(load.deliveryDate).toLocaleDateString() : 'Invalid Date';
              const lowestBid = load.current_lowest_bid || load.lowestBid;
              return (
                <div
                  key={id}
                  className={`GOML-load-card ${status.toLowerCase()}`}
                  onClick={() => handleCardClick(id)}
                  style={{ cursor: 'pointer' }}
                >
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
                    <p><strong>Current Lowest Bid:</strong> ₹{lowestBid || 'N/A'}</p>
                    {load.acceptedDriverId && (
                      <p><strong>Driver ID:</strong> {load.acceptedDriverId}</p>
                    )}
                    {load.driverId && !load.acceptedDriverId && (
                      <p><strong>Driver ID:</strong> {load.driverId}</p>
                    )}
                    {load.winningBidDriverId && !load.acceptedDriverId && !load.driverId && (
                      <p><strong>Driver ID:</strong> {load.winningBidDriverId}</p>
                    )}
                  </div>
                  {/* Removed GOML-load-actions (View Bids/Cancel Load buttons) */}
                  {expandedLoadId === id && (
                    <>
                      <div className="GOML-bids-section">
                        {bidsLoading && <p>Loading bids...</p>}
                        {bidsError && <p className="error-message">{bidsError}</p>}
                        {!bidsLoading && !bidsError && (
                          bids.length === 0
                            ? <p>No bids available for your load.</p>
                            : (
                              <div>
                                {Object.values(bids.reduce((acc, bid) => {
                                  if (!acc[bid.driver_id]) {
                                    acc[bid.driver_id] = bid;
                                  }
                                  return acc;
                                }, {}))
                                .filter(bid => {
                                  // For in_transit, delivered, completed, cancelled, awaiting_driver_response: only show the accepted driver's bid
                                  if (["in_transit", "delivered", "completed", "cancelled", "canceled", "awaiting_driver_response"].includes(load.status)) {
                                    return bid.driver_id === load.acceptedDriverId || bid.driver_id === load.accepted_driver_id;
                                  }
                                  // If load is active/assigned/pending, only show drivers who have NOT declined
                                  if (["active", "assigned", "pending"].includes(load.status)) {
                                    return bid.bid_status !== 'DECLINED';
                                  }
                                  return true; // Otherwise, show all bids
                                })
                                .map((bid, idx, arr) => (
                                  <div className="GOML-hire-button" key={bid.driver_id} style={{ marginBottom: '1em' }}>
                                    <div><strong>Driver ID:</strong> {bid.driver_id || 'N/A'}</div>
                                    <div>Driver Name: {bid.driver_name || 'N/A'}</div>
                                    <div>Email: {bid.driver_email || 'N/A'}</div>
                                    <div>Phone: {bid.driver_phone || 'N/A'}</div>
                                    <div><strong>Latest Bid:</strong> ₹{bid.amount !== undefined ? bid.amount : 'N/A'}</div>
                                    {load.status === 'pending' ? (
                                      <button onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                          const { hireDriverForLoad } = await import('../../services/goodsOwnerService');
                                          await hireDriverForLoad(id, bid.driver_id);
                                          const updatedLoads = await import('../../services/goodsOwnerService').then(mod => mod.fetchMyLoads());
                                          setLoads(Array.isArray(updatedLoads) ? updatedLoads : []);
                                          alert('Driver hired and load activated!');
                                        } catch (err) {
                                          alert('Failed to hire driver.');
                                        }
                                      }}>Hire</button>
                                    ) : ((load.status === 'assigned' || load.status === 'active') && (load.acceptedDriverId === bid.driver_id || load.accepted_driver_id === bid.driver_id)) ? (
                                      <button
                                        style={{ background: 'red', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          try {
                                            const { cancelLoad } = await import('../../services/goodsOwnerService');
                                            await cancelLoad(id);
                                            const updatedLoads = await import('../../services/goodsOwnerService').then(mod => mod.fetchMyLoads());
                                            setLoads(Array.isArray(updatedLoads) ? updatedLoads : []);
                                            alert('Load cancelled successfully!');
                                          } catch (err) {
                                            alert('Failed to cancel load.');
                                          }
                                        }}
                                      >Cancel</button>
                                    ) : null}
                                    {idx < arr.length - 1 && (
                                      <div style={{ borderBottom: '1px solid var(--border-color)', margin: '1em 0' }}></div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            } catch (cardError) {
              return <div key={load && load.id ? load.id : index} className="GOML-load-card error">Error displaying this load.</div>;
            }
          })}
        </div>
      )}
    </div>
  );
};

export default MyLoads;
