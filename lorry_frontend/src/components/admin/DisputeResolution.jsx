// src/components/admin/DisputeResolution.js
import React, { useState, useEffect } from 'react';
import './DisputeResolution.css';
import { fetchDisputes, resolveDispute } from '../../services/adminService';

const DisputeResolution = () => {
  const [disputesData, setDisputesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('open');

  useEffect(() => {
    const loadDisputes = async () => {
      setLoading(true);
      setError(null);
      try {
        // console.log('DisputeResolution: Fetching all disputes.');
        const data = await fetchDisputes();
        // console.log('DisputeResolution: Successfully fetched data:', data);
        if (!Array.isArray(data)) {
          // console.error('DisputeResolution: Data is not an array!', data);
          throw new Error('Received invalid data format from server for disputes.');
        }
        setDisputesData(data || []);
      } catch (err) {
        // console.error('DisputeResolution: Detailed error fetching disputes:', err);
        setError(err.message || 'Failed to fetch disputes. Please check console for details.');
        setDisputesData([]);
      } finally {
        setLoading(false);
      }
    };
    loadDisputes();
  }, []);

  const handleResolve = async (disputeId, resolutionAction) => {
    try {
      // console.log(`DisputeResolution: Resolving dispute ID ${disputeId} with action: ${resolutionAction}.`);
      // The actual resolution message/details might come from a form or be predefined
      const resolutionMessage = resolutionAction === 'approved' ? 'Complaint approved by admin.' : 'Complaint rejected by admin.';
      const status = resolutionAction === 'approved' ? 'resolved' : 'rejected';
      await resolveDispute(disputeId, { resolution_details: resolutionMessage, status });

      // Refetch or update local state
      setLoading(true); // Show loading while refetching
      const data = await fetchDisputes();
      if (Array.isArray(data)) {
        setDisputesData(data);
      } else {
        setDisputesData([]); // Or handle error from refetch
      }
      // console.log(`DisputeResolution: Dispute ID ${disputeId} resolved.`);
    } catch (err) {
      // console.error(`DisputeResolution: Error resolving dispute ID ${disputeId}:`, err);
      setError(err.message || `Failed to resolve dispute ${disputeId}.`);
    } finally {
      setLoading(false); // Ensure loading is false even if refetch fails
    }
  };

  const filteredDisputes = disputesData.filter(dispute => {
    if (activeTab === 'open') {
      return dispute.status === 'open' || dispute.status === 'pending';
    } else if (activeTab === 'resolved') {
      return dispute.status === 'resolved';
    } else if (activeTab === 'rejected') {
      return dispute.status === 'rejected';
    }
    return false;
  });

  if (loading) return <div className="ADR-loading">Loading disputes...</div>;
  if (error) return <div className="ADR-error-message">{error}</div>;

  return (
    <div className="ADR-dispute-resolution">
      <div className="ADR-management-header">
        <h2>Dispute Resolution</h2>
        <div className="ADR-tabs">
          <button
            className={`ADR-tab-button ${activeTab === 'open' ? 'active' : ''}`}
            onClick={() => setActiveTab('open')}
          >
            Open Disputes
          </button>
          <button
            className={`ADR-tab-button ${activeTab === 'resolved' ? 'active' : ''}`}
            onClick={() => setActiveTab('resolved')}
          >
            Resolved Disputes
          </button>
          <button
            className={`ADR-tab-button ${activeTab === 'rejected' ? 'active' : ''}`}
            onClick={() => setActiveTab('rejected')}
          >
            Rejected Disputes
          </button>
        </div>
      </div>

      {!loading && !error && filteredDisputes.length === 0 ? (
        <div className="ADR-no-results">
          No {activeTab} disputes found.
        </div>
      ) : (
        <div className="ADR-disputes-list">
          {filteredDisputes.map((dispute, index) => {
            try {
              if (!dispute || typeof dispute !== 'object') {
                // console.error(`DisputeResolution: Invalid dispute item at index ${index}:`, dispute);
                return <div key={index} className="ADR-dispute-card error">Invalid dispute data</div>;
              }

              const id = dispute.id || `missing-id-${index}`;
              const loadId = dispute.loadId || 'N/A';
              const driverId = dispute.driverId || 'N/A';
              const ownerId = dispute.ownerId || 'N/A';
              const disputeType = dispute.disputeType || 'N/A';
              const createdAtStr = dispute.created_at && !isNaN(new Date(dispute.created_at)) ? new Date(dispute.created_at).toLocaleString() : 'Invalid Date';
              const message = dispute.message || 'No message provided.';
              const status = dispute.status || 'N/A';
              const resolutionDetails = dispute.resolution_details || null;
              const driverName = dispute.driver_name || 'N/A';
              const driverEmail = dispute.driver_email || 'N/A';
              const driverPhone = dispute.driver_phone || 'N/A';
              const ownerName = dispute.owner_name || 'N/A';
              const ownerEmail = dispute.owner_email || 'N/A';
              const ownerPhone = dispute.owner_phone || 'N/A';

              return (
                <div key={id} className="ADR-dispute-card">
                  <div className="ADR-dispute-header">
                    <h3>Dispute #{id}</h3>
                    <span className={`ADR-status-badge ${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </div>
                  <div className="ADR-dispute-details">
                    <p><strong>Load ID:</strong> {loadId}</p>
                    <p><strong>Driver Details:</strong></p>
                    <p><strong>ID:</strong> {driverId}</p>
                    <p><strong>Name:</strong> {driverName}</p>
                    <p><strong>Email:</strong> {driverEmail}</p>
                    <p><strong>Phone:</strong> {driverPhone}</p>
                    <p><strong>Owner Details:</strong></p>
                    <p><strong>ID:</strong> {ownerId}</p>
                    <p><strong>Name:</strong> {ownerName}</p>
                    <p><strong>Email:</strong> {ownerEmail}</p>
                    <p><strong>Phone:</strong> {ownerPhone}</p>
                    <p><strong>Type:</strong> {disputeType}</p>
                    <p><strong>Date:</strong> {createdAtStr}</p>
                  </div>
                  <div className="ADR-dispute-message">
                    <p><strong>Message:</strong></p>
                    <p>{message}</p>
                  </div>

                  {(status === 'open' || status === 'pending') && (
                    <div className="ADR-resolution-actions">
                      <button
                        className="ADR-resolve-btn approve"
                        onClick={() => handleResolve(id, 'approved')}
                      >
                        Approve Complaint
                      </button>
                      <button
                        className="ADR-resolve-btn reject"
                        onClick={() => handleResolve(id, 'rejected')}
                      >
                        Reject Complaint
                      </button>
                    </div>
                  )}

                  {status === 'resolved' && resolutionDetails && (
                    <div className="ADR-resolution-outcome">
                      <p><strong>Resolution:</strong> {resolutionDetails}</p>
                    </div>
                  )}
                </div>
              );
            } catch (cardError) {
              // console.error(`DisputeResolution: Error rendering dispute card for dispute at index ${index}:`, dispute, cardError);
              return <div key={dispute && dispute.id ? dispute.id : index} className="ADR-dispute-card error">Error displaying this dispute.</div>;
            }
          })}
        </div>
      )}
    </div>
  );
};

export default DisputeResolution;