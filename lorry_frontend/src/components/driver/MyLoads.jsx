import React, { useState, useEffect } from 'react';
import './MyLoadsD.css';
import { fetchDriverMyLoads, updateLoadStatus } from '../../services/driverService';
import { useAuth } from '../../context/AuthContext';
import { fetchOwnerPublicProfile } from '../../services/goodsOwnerService';

const MyLoads = () => {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('accepted');
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedLoadId, setExpandedLoadId] = useState(null);
  const { authUser } = useAuth();
  const [ownerDetails, setOwnerDetails] = useState({});

  useEffect(() => {
    const fetchLoads = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDriverMyLoads();
        setLoads(data || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch loads.');
        setLoads([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLoads();
    // Listen for bid accept/decline events to refresh loads
    const handleLoadsUpdate = () => fetchLoads();
    window.addEventListener('driver-loads-updated', handleLoadsUpdate);
    return () => {
      window.removeEventListener('driver-loads-updated', handleLoadsUpdate);
    };
  }, []);

  const acceptedLoads = loads.filter(
    load => [
      'assigned',
      'accepted',
      'active',
      'in_transit',
      'awaiting_driver_response'
    ].includes((load.status || '').toLowerCase())
  );
  const cancelledOrDeclinedLoads = loads.filter(
    load => load.status === 'cancelled' || load.status === 'declined'
  );
  const completedLoads = loads.filter(
    load => load.status === 'delivered' || load.status === 'completed'
  );

  const handleStatusChange = async (loadId, newStatus) => {
    setUpdatingId(loadId);
    try {
      await updateLoadStatus(loadId, newStatus);
      setLoads(prev => prev.map(load => load.id === loadId ? { ...load, status: newStatus } : load));
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExpand = async (id, ownerId) => {
    if (expandedLoadId === id) {
      setExpandedLoadId(null);
      return;
    }
    setExpandedLoadId(id);
    if (ownerId && !ownerDetails[id]) {
      try {
        const owner = await fetchOwnerPublicProfile(ownerId);
        setOwnerDetails(prev => ({ ...prev, [id]: owner }));
      } catch (err) {
        setOwnerDetails(prev => ({ ...prev, [id]: { error: 'Failed to fetch owner details.' } }));
      }
    }
  };

  const renderLoads = (loadsToRender) => (
    loadsToRender.length === 0 ? (
      <p className="DL-no-loads">No loads in this category.</p>
    ) : (
      <div className="DL-loads-list">
        {loadsToRender.map((load, index) => {
          let status = load.status;
          let statusClass = '';
          if (status === 'assigned' || status === 'accepted' || status === 'active' || status === 'in_transit') statusClass = 'accepted';
          else if (status === 'declined') statusClass = 'declined';
          else if (status === 'cancelled') statusClass = 'cancelled';
          else if (status === 'delivered' || status === 'completed') statusClass = 'completed';
          const id = load.id || index;
          const ownerId = load.owner_id;
          const isExpanded = expandedLoadId === id;
          return (
            <div
              key={id}
              className={`DL-load-card ${statusClass}`}
              onClick={() => handleExpand(id, ownerId)}
              style={{ cursor: 'pointer', boxShadow: isExpanded ? '0 0 0 2px var(--input-focus)' : undefined, background: isExpanded ? 'var(--input-inside)' : undefined, transition: 'box-shadow 0.2s, background 0.2s' }}
            >
              <div className="DL-load-info">
                <h3>{load.goodsType || 'N/A'}</h3>
                <p><strong>Load ID:</strong> {load.id || 'N/A'}</p>
                <p><strong>Route:</strong> {load.pickupLocation || 'N/A'} → {load.deliveryLocation || 'N/A'}</p>
                <p><strong>Status:</strong> <span className={`DL-status-badge ${statusClass}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span></p>
                <p><strong>Posted:</strong> {load.posted_date ? new Date(load.posted_date).toLocaleString() : 'N/A'}</p>
                <p><strong>Expected Price:</strong> ₹{load.expectedPrice !== undefined ? load.expectedPrice : 'N/A'}</p>
                {authUser && load.accepted_driver_id === authUser.id && (
                  <p style={{color: 'green', fontWeight: 'bold'}}>
                    You Bet: ₹{load.current_lowest_bid !== undefined ? load.current_lowest_bid : 'N/A'}
                  </p>
                )}
                {(status === 'assigned' || status === 'active' || status === 'in_transit') && (
                  <div style={{ marginTop: 8 }}>
                    <label htmlFor={`status-select-${load.id}`}>Update Status: </label>
                    <select
                      id={`status-select-${load.id}`}
                      value=""
                      disabled={updatingId === load.id}
                      onChange={e => handleStatusChange(load.id, e.target.value)}
                    >
                      <option value="" disabled>Select...</option>
                      {status === 'assigned' && <option value="active">Active</option>}
                      {status === 'active' && <option value="in_transit">In Transit</option>}
                      {(status === 'active' || status === 'in_transit') && <option value="delivered">Delivered</option>}
                    </select>
                  </div>
                )}
              </div>
              {isExpanded && (
                <>
                  <div className="DL-owner-details" style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    <h4>Goods Owner Details</h4>
                    {ownerDetails[id] ? (
                      ownerDetails[id].error ? (
                        <p>{ownerDetails[id].error}</p>
                      ) : (
                        <>
                          <p><strong>Id:</strong> {ownerId || 'N/A'}</p>
                          <p><strong>Username:</strong> {ownerDetails[id].username || 'N/A'}</p>
                          <p><strong>Email:</strong> {ownerDetails[id].email || 'N/A'}</p>
                          <p><strong>Phone Number:</strong> {ownerDetails[id].phone_number || 'N/A'}</p>
                        </>
                      )
                    ) : (
                      <p>Loading owner details...</p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    )
  );

  if (loading) return <div className="DL-loading">Loading your loads...</div>;
  if (error) return <div className="DL-error-message">{error}</div>;

  return (
    <div className="DL-my-loads">
      <div className="DL-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>My Loads</h2>
        <div className="DL-tabs" style={{ display: 'flex', gap: '8px', marginBottom:'20px' }}>
          <button
            className={activeTab === 'accepted' ? 'active' : ''}
            onClick={() => setActiveTab('accepted')}
          >
            Accepted Loads
          </button>
          <button
            className={activeTab === 'cancelled' ? 'active' : ''}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled/Declined Loads
          </button>
          <button
            className={activeTab === 'completed' ? 'active' : ''}
            onClick={() => setActiveTab('completed')}
          >
            Completed Loads
          </button>
        </div>
      </div>
      <div className="DL-tab-content">
        {activeTab === 'accepted'
          ? renderLoads(acceptedLoads)
          : activeTab === 'cancelled'
          ? renderLoads(cancelledOrDeclinedLoads)
          : renderLoads(completedLoads)}
      </div>
    </div>
  );
};

export default MyLoads;
