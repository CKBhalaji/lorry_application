// src/components/goods-owner/ManageDisputes.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GOManageDisputes.css';
import { fetchOwnerDisputes, createOwnerDispute } from '../../services/goodsOwnerService';

const ManageDisputes = () => {
  const [disputesData, setDisputesData] = useState([]); // Renamed to avoid conflict
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    driverId: '',
    loadId: '',
    disputeType: 'service',
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
        console.log('GOManageDisputes: Fetching owner disputes.');
        const data = await fetchOwnerDisputes();
        console.log('GOManageDisputes: Successfully fetched data:', data);
        if (!Array.isArray(data)) {
          console.error('GOManageDisputes: Data is not an array!', data);
          throw new Error('Received invalid data format from server for disputes.');
        }
        setDisputesData(data || []);
      } catch (err) {
        console.error('GOManageDisputes: Detailed error fetching disputes:', err);
        setError(err.message || 'Failed to fetch disputes. Please check console for details.');
        setDisputesData([]);
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
    if (!formData.driverId) newErrors.driverId = 'Driver ID is required';
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
      const newDispute = await createOwnerDispute(formData); // Service call
      setDisputesData(prevDisputes => [newDispute, ...prevDisputes]); // Optimistic update
      setShowCreateForm(false); // Hide form
      setFormData({ // Reset form
        driverId: '',
        loadId: '',
        disputeType: 'service',
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
      <span className={`GOMD-status-badge ${statusClasses[status] || ''}`}>
        {status}
      </span>
    );
  };

  if (loading) return <div className="GOMD-loading">Loading disputes...</div>;
  if (error) return <div className="GOMD-error-message">{error}</div>;

  return (
    <div className="GOMD-manage-disputes-owner">
      <div className="GOMD-disputes-header">
        <h2>My Disputes</h2>
        <button
          className={`GOMD-toggle-form-btn ${showCreateForm ? 'cancel' : 'add'}`}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Add New Dispute'}
        </button>
      </div>

      {showCreateForm && (
        <div className="GOMD-create-dispute-form">
          <h3>Create New Dispute</h3>
          <form onSubmit={handleSubmit}>
            <div className="GOMD-form-group">
              <label>Driver ID</label>
              <input
                type="text"
                name="driverId"
                value={formData.driverId}
                onChange={handleChange}
                className={errors.driverId ? 'error' : ''}
              />
              {errors.driverId && <span className="GOMD-error-message">{errors.driverId}</span>}
            </div>

            <div className="GOMD-form-group">
              <label>Load ID</label>
              <input
                type="text"
                name="loadId"
                value={formData.loadId}
                onChange={handleChange}
                className={errors.loadId ? 'error' : ''}
              />
              {errors.loadId && <span className="GOMD-error-message">{errors.loadId}</span>}
            </div>

            <div className="GOMD-form-group">
              <label>Dispute Type</label>
              <select
                name="disputeType"
                value={formData.disputeType}
                onChange={handleChange}
              >
                <option value="service">Service Quality</option>
                <option value="delay">Delivery Delay</option>
                <option value="damage">Goods Damage</option>
                <option value="payment">Payment Discrepancy</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="GOMD-form-group">
              <label>Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={errors.message ? 'error' : ''}
                rows="5"
                placeholder="Describe your dispute in detail..."
              />
              <div className="GOMD-char-count">
                {formData.message.length}/500 characters
              </div>
              {errors.message && <span className="GOMD-error-message">{errors.message}</span>}
            </div>

            <div className="GOMD-form-group">
              <label>Attachment (Optional)</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
              />
              <small>Upload supporting documents (max 5MB)</small>
            </div>

            <div className="GOMD-form-actions">
              <button
                type="submit"
                className="GOMD-submit-btn"
              >
                Submit Dispute
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="GOMD-disputes-list">
        {!loading && !error && disputesData.length === 0 ? (
          <div className="GOMD-no-disputes">
            {showCreateForm ? '' : 'You have no disputes yet.'}
          </div>
        ) : (
          disputesData.map((dispute, index) => {
            try {
              if (!dispute || typeof dispute !== 'object') {
                console.error(`GOManageDisputes: Invalid dispute item at index ${index}:`, dispute);
                return <div key={index} className="GOMD-dispute-card error">Invalid dispute data</div>;
              }

              const id = dispute.id || `missing-id-${index}`;
              const driverId = dispute.driverId || 'N/A';
              const loadId = dispute.loadId || 'N/A';
              const type = dispute.type || 'N/A';
              const status = dispute.status || 'N/A';
              const message = dispute.message || 'No message provided.';
              const createdAtStr = dispute.createdAt && !isNaN(new Date(dispute.createdAt)) ? new Date(dispute.createdAt).toLocaleDateString() : 'Invalid Date';
              const resolution = dispute.resolution || null;
              const resolvedAtStr = dispute.resolvedAt && !isNaN(new Date(dispute.resolvedAt)) ? new Date(dispute.resolvedAt).toLocaleDateString() : null;
              const attachments = dispute.attachments || null;

              return (
                <div key={id} className="GOMD-dispute-card">
                  <div className="GOMD-dispute-header">
                    <h3>Dispute #{id}</h3>
                    {getStatusBadge(status)}
                  </div>
                  <div className="GOMD-dispute-details">
                    <p><strong>Driver ID:</strong> {driverId}</p>
                    <p><strong>Load ID:</strong> {loadId}</p>
                    <p><strong>Type:</strong> {type}</p>
                    <p><strong>Date:</strong> {createdAtStr}</p>
                  </div>
                  <div className="GOMD-dispute-message">
                    <p><strong>Message:</strong> {message}</p>
                  </div>
                  {resolution && (
                    <div className="GOMD-dispute-resolution">
                      <p><strong>Resolution:</strong> {resolution}</p>
                      {resolvedAtStr && (
                        <p><strong>Resolved on:</strong> {resolvedAtStr}</p>
                      )}
                    </div>
                  )}
                  {attachments && attachments.url && attachments.name && ( // Added check for url and name
                    <div className="GOMD-dispute-attachments">
                      <strong>Attachments:</strong>
                      <a href={attachments.url} target="_blank" rel="noopener noreferrer">
                        {attachments.name}
                      </a>
                    </div>
                  )}
                </div>
              );
            } catch (cardError) {
              console.error(`GOManageDisputes: Error rendering dispute card for dispute at index ${index}:`, dispute, cardError);
              return <div key={dispute && dispute.id ? dispute.id : index} className="GOMD-dispute-card error">Error displaying this dispute.</div>;
            }
          })
        )}
      </div>
    </div>
  );
};

export default ManageDisputes;