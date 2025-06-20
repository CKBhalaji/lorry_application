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
        console.log('DisputeResolution: Fetching all disputes.');
        const data = await fetchDisputes();
        console.log('DisputeResolution: Successfully fetched data:', data);
        if (!Array.isArray(data)) {
          console.error('DisputeResolution: Data is not an array!', data);
          throw new Error('Received invalid data format from server for disputes.');
        }
        setDisputesData(data || []);
      } catch (err) {
        console.error('DisputeResolution: Detailed error fetching disputes:', err);
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
      console.log(`DisputeResolution: Resolving dispute ID ${disputeId} with action: ${resolutionAction}.`);
      // The actual resolution message/details might come from a form or be predefined
      const resolutionMessage = resolutionAction === 'approved' ? 'Complaint approved by admin.' : 'Complaint rejected by admin.';
      await resolveDispute(disputeId, resolutionMessage); // Assuming resolveDispute API updates status and adds resolution text

      // Refetch or update local state
      // For simplicity, refetching; ideally, API returns updated object or we update locally more precisely
      setLoading(true); // Show loading while refetching
      const data = await fetchDisputes();
      if (Array.isArray(data)) {
        setDisputesData(data);
      } else {
        setDisputesData([]); // Or handle error from refetch
      }
      console.log(`DisputeResolution: Dispute ID ${disputeId} resolved.`);
    } catch (err) {
      console.error(`DisputeResolution: Error resolving dispute ID ${disputeId}:`, err);
      setError(err.message || `Failed to resolve dispute ${disputeId}.`);
    } finally {
      setLoading(false); // Ensure loading is false even if refetch fails
    }
  };

  const filteredDisputes = disputesData.filter(dispute =>
    activeTab === 'open' ? dispute.status === 'open' || dispute.status === 'pending' : dispute.status === 'resolved' // Adjusted to include 'pending' in open
  );

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
                console.error(`DisputeResolution: Invalid dispute item at index ${index}:`, dispute);
                return <div key={index} className="ADR-dispute-card error">Invalid dispute data</div>;
              }

              const id = dispute.id || `missing-id-${index}`;
              const loadId = dispute.loadId || 'N/A';
              const complainantName = dispute.complainantName || 'N/A';
              const againstName = dispute.againstName || 'N/A';
              const dateStr = dispute.date || dispute.createdAt; // Prefer 'date' if available, else 'createdAt'
              const formattedDate = dateStr && !isNaN(new Date(dateStr)) ? new Date(dateStr).toLocaleString() : 'Invalid Date';
              const message = dispute.message || 'No message provided.';
              const status = dispute.status || 'N/A';
              const resolution = dispute.resolution || null;
              const resolvedDateStr = dispute.resolvedDate && !isNaN(new Date(dispute.resolvedDate)) ? new Date(dispute.resolvedDate).toLocaleString() : null;

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
                    <p><strong>Complainant:</strong> {complainantName}</p>
                    <p><strong>Against:</strong> {againstName}</p>
                    <p><strong>Date:</strong> {formattedDate}</p>
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

                  {status === 'resolved' && resolution && (
                    <div className="ADR-resolution-outcome">
                      <p><strong>Resolution:</strong> {resolution}</p>
                      {resolvedDateStr && <p><strong>Resolved on:</strong> {resolvedDateStr}</p>}
                    </div>
                  )}
                </div>
              );
            } catch (cardError) {
              console.error(`DisputeResolution: Error rendering dispute card for dispute at index ${index}:`, dispute, cardError);
              return <div key={dispute && dispute.id ? dispute.id : index} className="ADR-dispute-card error">Error displaying this dispute.</div>;
            }
          })}
        </div>
      )}
    </div>
  );
};

export default DisputeResolution;