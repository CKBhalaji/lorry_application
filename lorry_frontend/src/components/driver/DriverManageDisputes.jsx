// src/components/driver/ManageDisputes.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DriverManageDisputes.css';
import { fetchDriverDisputes, createDriverDispute } from '../../services/driverService';

const ManageDisputes = () => {
  // In the component:
  const [disputes, setDisputesState] = useState([]); // Renamed to avoid conflict with variable name in map
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    loadId: '',
    disputeType: 'payment',
    message: '',
    attachments: null
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadDisputes = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('DriverManageDisputes: Fetching driver disputes.');
        const data = await fetchDriverDisputes();
        console.log('DriverManageDisputes: Successfully fetched data:', data);
        if (!Array.isArray(data)) {
          console.error('DriverManageDisputes: Data is not an array!', data);
          throw new Error('Received invalid data format from server for disputes.');
        }
        setDisputesState(data || []);
      } catch (err) {
        console.error('DriverManageDisputes: Detailed error fetching disputes:', err);
        setError(err.message || 'Failed to fetch disputes. Please check console for details.');
        setDisputesState([]); // Ensure disputes is an array on error
      } finally {
        setLoading(false);
      }
    };
    loadDisputes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      attachments: e.target.files[0]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.loadId) newErrors.loadId = 'Load ID is required';
    if (!formData.message) newErrors.message = 'Message is required';
    if (formData.message.length > 500) newErrors.message = 'Message too long (max 500 chars)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const newDispute = await createDriverDispute(formData); // This service call might need its own error handling/logging
      setDisputesState(prevDisputes => [newDispute, ...prevDisputes]); // Use functional update
      // setShowCreateForm(false); // Typically hide form after successful submission
      alert('Dispute created successfully!'); // Keep alert or use a more integrated notification system
      // Reset form and hide
      setShowCreateForm(false);
      setFormData({
        loadId: '',
        disputeType: 'payment',
        message: '',
        attachments: null
      });
      alert('Dispute created successfully!');
    } catch (error) {
      console.error('Error creating dispute:', error);
      alert(error.message || 'Failed to create dispute');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'pending',
      accepted: 'accepted',
      rejected: 'rejected',
      resolved: 'resolved'
    };
    return (
      <span className={`DMD-status-badge ${statusClasses[status] || ''}`}>
        {status}
      </span>
    );
  };

  if (loading) return <div className="DMD-loading">Loading disputes...</div>;
  if (error) return <div className="DMD-error-message">{error}</div>;


  return (
    <div className="DMD-manage-disputes-driver">
      <div className="DMD-disputes-header">
        <h2>My Disputes</h2>
        <button
          className={`DMD-toggle-form-btn ${showCreateForm ? 'cancel' : 'add'}`}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Add New Dispute'}
        </button>
      </div>

      {showCreateForm && (
        <div className="DMD-create-dispute-form">
          <h3>Create New Dispute</h3>
          <form onSubmit={handleSubmit}>
            <div className="DMD-form-group">
              <label>Load ID</label>
              <input
                type="text"
                name="loadId"
                value={formData.loadId}
                onChange={handleChange}
                className={errors.loadId ? 'error' : ''}
              />
              {errors.loadId && <span className="DMD-error-message">{errors.loadId}</span>}
            </div>

            <div className="DMD-form-group">
              <label>Dispute Type</label>
              <select
                name="disputeType"
                value={formData.disputeType}
                onChange={handleChange}
              >
                <option value="payment">Payment Issue</option>
                <option value="delivery">Delivery Problem</option>
                <option value="goods">Goods Condition</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="DMD-form-group">
              <label>Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={errors.message ? 'error' : ''}
                rows="5"
                placeholder="Describe your dispute in detail..."
              />
              <div className="DMD-char-count">
                {formData.message.length}/500 characters
              </div>
              {errors.message && <span className="DMD-error-message">{errors.message}</span>}
            </div>

            <div className="DMD-form-group">
              <label>Attachment (Optional)</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
              />
              <small>Upload supporting documents (max 5MB)</small>
            </div>

            <div className="DMD-form-actions">
              <button
                type="submit"
                className="DMD-submit-btn"
              >
                Submit Dispute
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="DMD-disputes-list">
        {!loading && !error && disputes.length === 0 ? (
          <div className="DMD-no-disputes">
            {showCreateForm ? '' : 'You have no disputes yet.'}
          </div>
        ) : (
          disputes.map((dispute, index) => {
            try {
              if (!dispute || typeof dispute !== 'object') {
                console.error(`DriverManageDisputes: Invalid dispute item at index ${index}:`, dispute);
                return <div key={index} className="DMD-dispute-card error">Invalid dispute data</div>;
              }

              const id = dispute.id || `missing-id-${index}`;
              const loadId = dispute.loadId || 'N/A';
              const type = dispute.type || 'N/A';
              const status = dispute.status || 'N/A';
              const message = dispute.message || 'No message provided.';
              const createdAtStr = dispute.createdAt && !isNaN(new Date(dispute.createdAt)) ? new Date(dispute.createdAt).toLocaleDateString() : 'Invalid Date';
              const resolution = dispute.resolution || null;
              const resolvedAtStr = dispute.resolvedAt && !isNaN(new Date(dispute.resolvedAt)) ? new Date(dispute.resolvedAt).toLocaleDateString() : null;
              const attachments = dispute.attachments || null;

              return (
                <div key={id} className="DMD-dispute-card">
                  <div className="DMD-dispute-header">
                    <h3>Dispute #{id}</h3>
                    {getStatusBadge(status)}
                  </div>
                  <div className="DMD-dispute-details">
                    <p><strong>Load ID:</strong> {loadId}</p>
                    <p><strong>Type:</strong> {type}</p>
                    <p><strong>Date:</strong> {createdAtStr}</p>
                  </div>
                  <div className="DMD-dispute-message">
                    <p><strong>Message:</strong> {message}</p>
                  </div>
                  {resolution && (
                    <div className="DMD-dispute-resolution">
                      <p><strong>Resolution:</strong> {resolution}</p>
                      {resolvedAtStr && (
                        <p><strong>Resolved on:</strong> {resolvedAtStr}</p>
                      )}
                    </div>
                  )}
                  {attachments && (
                    <div className="DMD-dispute-attachments">
                      <strong>Attachments:</strong>
                      <a href={attachments.url} target="_blank" rel="noopener noreferrer">
                        {attachments.name || 'View Attachment'}
                      </a>
                    </div>
                  )}
                </div>
              );
            } catch (cardError) {
              console.error(`DriverManageDisputes: Error rendering dispute card for dispute at index ${index}:`, dispute, cardError);
              return <div key={dispute && dispute.id ? dispute.id : index} className="DMD-dispute-card error">Error displaying this dispute.</div>;
            }
          })
        )}
      </div>
    </div>
  );
};

export default ManageDisputes;