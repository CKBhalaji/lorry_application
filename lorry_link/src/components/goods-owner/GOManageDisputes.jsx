// src/components/goods-owner/ManageDisputes.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GOManageDisputes.css';
import { fetchOwnerDisputes, createOwnerDispute } from '../../services/goodsOwnerService';

const ManageDisputes = () => {
  const [disputes, setDisputes] = useState([
    {
      id: 1,
      driverId: 'DRV123',
      loadId: 'LOAD456',
      type: 'Payment',
      status: 'pending',
      message: 'The payment amount is incorrect.',
      createdAt: '2023-10-01T09:00:00Z',
      resolution: '',
      resolvedAt: null,
      attachments: {
        name: 'invoice.pdf',
        url: 'https://example.com/invoice.pdf'
      }
    },
    {
      id: 2,
      driverId: 'DRV789',
      loadId: 'LOAD101',
      type: 'Delivery',
      status: 'resolved',
      message: 'Package was damaged during delivery.',
      createdAt: '2023-09-28T14:30:00Z',
      resolution: 'Compensation provided.',
      resolvedAt: '2023-09-29T10:15:00Z',
      attachments: null
    },
    {
      id: 3,
      driverId: 'DRV456',
      loadId: 'LOAD789',
      type: 'Service',
      status: 'accepted',
      message: 'Driver arrived late for pickup.',
      createdAt: '2023-09-25T11:45:00Z',
      resolution: 'Driver warned about punctuality.',
      resolvedAt: '2023-09-26T09:30:00Z',
      attachments: null
    },
    {
      id: 4,
      driverId: 'DRV101',
      loadId: 'LOAD112',
      type: 'Documentation',
      status: 'rejected',
      message: 'Missing delivery confirmation signature.',
      createdAt: '2023-09-20T16:20:00Z',
      resolution: 'Signature not required for this delivery.',
      resolvedAt: '2023-09-21T10:00:00Z',
      attachments: {
        name: 'delivery_note.pdf',
        url: 'https://example.com/delivery_note.pdf'
      }
    }
  ]);

  // ... existing code ...
  // const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // useEffect(() => {
  //   const loadDisputes = async () => {
  //     try {
  //       const data = await fetchOwnerDisputes();
  //       setDisputes(data);
  //     } catch (error) {
  //       console.error('Error fetching disputes:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   loadDisputes();
  // }, []);

  useEffect(() => {
    const loadDisputes = async () => {
      try {
        const data = await fetchOwnerDisputes();
        // Only set data if it exists and is an array
        if (Array.isArray(data) && data.length) {
          setDisputes(data);
        }
      } catch (error) {
        console.error('Error fetching disputes:', error);
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
      const newDispute = await createOwnerDispute(formData);
      setDisputes([newDispute, ...disputes]);
      setShowCreateForm(false);
      setFormData({
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
        {/* {Array.isArray(disputes) ? ( */}
        {disputes && disputes.length > 0 ? (
          disputes.length === 0 ? (
            <div className="GOMD-no-disputes">
              {showCreateForm ? '' : 'You have no disputes yet.'}
            </div>
          ) : (
            disputes.map(dispute => (
              <div key={dispute.id} className="GOMD-dispute-card">
                <div className="GOMD-dispute-header">
                  <h3>Dispute #{dispute.id}</h3>
                  {getStatusBadge(dispute.status)}
                </div>
                <div className="GOMD-dispute-details">
                  <p><strong>Driver ID:</strong> {dispute.driverId}</p>
                  <p><strong>Load ID:</strong> {dispute.loadId}</p>
                  <p><strong>Type:</strong> {dispute.type}</p>
                  <p><strong>Date:</strong> {new Date(dispute.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="GOMD-dispute-message">
                  <p><strong>Message:</strong> {dispute.message}</p>
                </div>
                {dispute.resolution && (
                  <div className="GOMD-dispute-resolution">
                    <p><strong>Resolution:</strong> {dispute.resolution}</p>
                    {dispute.resolvedAt && (
                      <p><strong>Resolved on:</strong> {new Date(dispute.resolvedAt).toLocaleDateString()}</p>
                    )}
                  </div>
                )}
                {dispute.attachments && (
                  <div className="GOMD-dispute-attachments">
                    <strong>Attachments:</strong>
                    <a href={dispute.attachments.url} target="_blank" rel="noopener noreferrer">
                      {dispute.attachments.name}
                    </a>
                  </div>
                )}
              </div>
            ))
          )
        ) : (
          <div className="GOMD-no-disputes">Loading disputes...</div>
        )}
      </div>
    </div>
  );
};

export default ManageDisputes;