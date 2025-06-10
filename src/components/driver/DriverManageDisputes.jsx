// src/components/driver/ManageDisputes.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DriverManageDisputes.css';
import { fetchDriverDisputes, createDriverDispute } from '../../services/driverService';

const ManageDisputes = () => {
  const disputes = [
    {
      id: 1,
      loadId: 'L12345',
      type: 'Late Delivery',
      status: 'pending',
      message: 'The delivery was delayed by 2 hours.',
      createdAt: '2023-10-01T10:00:00Z',
      attachments: {
        url: 'https://example.com/invoice.pdf',
        name: 'invoice.pdf'
      }
    },
    {
      id: 2,
      loadId: 'L67890',
      type: 'Damaged Goods',
      status: 'accepted',
      message: 'The goods were damaged during transit.',
      createdAt: '2023-09-25T09:30:00Z',
      resolvedAt: '2023-09-28T14:00:00Z',
      resolution: 'Compensation of $500 was provided.',
      attachments: {
        url: 'https://example.com/damage_report.pdf',
        name: 'damage_report.pdf'
      }
    },
    {
      id: 3,
      loadId: 'L54321',
      type: 'Incorrect Billing',
      status: 'rejected',
      message: 'The invoice amount does not match the agreed rate.',
      createdAt: '2023-10-05T11:15:00Z',
      attachments: {
        url: 'https://example.com/invoice.pdf',
        name: 'invoice.pdf'
      }
    },
    {
      id: 4,
      loadId: 'L54321',
      type: 'Incorrect Billing',
      status: 'resolved',
      message: 'The invoice amount does not match the agreed rate.',
      createdAt: '2023-10-05T11:15:00Z',
      attachments: {
        url: 'https://example.com/invoice.pdf',
        name: 'invoice.pdf'
      }
    }
  ];

  // In the component:
  // const [disputes, setDisputes] = useState(sampleDisputes);
  // const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const fetchDisputes = async () => {
      try {
        const data = await fetchDriverDisputes();
        setDisputes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching disputes:', error);
        setDisputes([]);
      }
      finally {
        setLoading(false);
      }
    };
    fetchDisputes();
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
      const newDispute = await createDriverDispute(formData);
      setDisputes([newDispute, ...disputes]);
      setShowCreateForm(true);
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
        {disputes.length === 0 ? (
          <div className="DMD-no-disputes">
            {showCreateForm ? '' : 'You have no disputes yet.'}
          </div>
        ) : (
          disputes.map(dispute => (
            <div key={dispute.id} className="DMD-dispute-card">
              <div className="DMD-dispute-header">
                <h3>Dispute #{dispute.id}</h3>
                {getStatusBadge(dispute.status)}
              </div>
              <div className="DMD-dispute-details">
                <p><strong>Load ID:</strong> {dispute.loadId}</p>
                <p><strong>Type:</strong> {dispute.type}</p>
                <p><strong>Date:</strong> {new Date(dispute.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="DMD-dispute-message">
                <p><strong>Message:</strong> {dispute.message}</p>
              </div>
              {dispute.resolution && (
                <div className="DMD-dispute-resolution">
                  <p><strong>Resolution:</strong> {dispute.resolution}</p>
                  {dispute.resolvedAt && (
                    <p><strong>Resolved on:</strong> {new Date(dispute.resolvedAt).toLocaleDateString()}</p>
                  )}
                </div>
              )}
              {dispute.attachments && (
                <div className="DMD-dispute-attachments">
                  <strong>Attachments:</strong>
                  <a href={dispute.attachments.url} target="_blank" rel="noopener noreferrer">
                    {dispute.attachments.name}
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageDisputes;