// src/components/goods-owner/PostLoad.js
import React, { useState } from 'react';
import './PostLoad.css';
import { postNewLoad } from '../../services/goodsOwnerService';

const PostLoad = () => {
  const [formData, setFormData] = useState({
    goodsType: '',
    weight: '',
    pickupLocation: '',
    deliveryLocation: '',
    pickupDate: '',
    deliveryDate: '',
    description: '',
    expectedPrice: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.goodsType) newErrors.goodsType = 'Required';
    if (!formData.weight || isNaN(formData.weight)) newErrors.weight = 'Valid number required';
    if (!formData.pickupLocation) newErrors.pickupLocation = 'Required';
    if (!formData.deliveryLocation) newErrors.deliveryLocation = 'Required';
    if (!formData.pickupDate) newErrors.pickupDate = 'Required';
    if (!formData.deliveryDate) newErrors.deliveryDate = 'Required';
    if (new Date(formData.deliveryDate) < new Date(formData.pickupDate)) {
      newErrors.deliveryDate = 'Delivery date must be after pickup date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await postNewLoad(formData);
      alert('Load posted successfully!');
      // Reset form
      setFormData({
        goodsType: '',
        weight: '',
        pickupLocation: '',
        deliveryLocation: '',
        pickupDate: '',
        deliveryDate: '',
        description: '',
        expectedPrice: ''
      });
    } catch (error) {
      // console.error('Error posting load:', error);
      alert('Failed to post load. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="GOPL-post-load">
      <h2>Post New Load</h2>
      <form onSubmit={handleSubmit}>
        <div className="GOPL-form-group">
          <label>Goods Type</label>
          <input
            type="text"
            name="goodsType"
            value={formData.goodsType}
            onChange={handleChange}
            className={errors.goodsType ? 'GOPL-error' : ''}
          />
          {errors.goodsType && <span className="GOPL-error-message">{errors.goodsType}</span>}
        </div>

        <div className="GOPL-form-group">
          <label>Weight (kg)</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            className={errors.weight ? 'GOPL-error' : ''}
          />
          {errors.weight && <span className="GOPL-error-message">{errors.weight}</span>}
        </div>

        <div className="GOPL-form-group">
          <label>Pickup Location</label>
          <input
            type="text"
            name="pickupLocation"
            value={formData.pickupLocation}
            onChange={handleChange}
            className={errors.pickupLocation ? 'GOPL-error' : ''}
          />
          {errors.pickupLocation && <span className="GOPL-error-message">{errors.pickupLocation}</span>}
        </div>

        <div className="GOPL-form-group">
          <label>Delivery Location</label>
          <input
            type="text"
            name="deliveryLocation"
            value={formData.deliveryLocation}
            onChange={handleChange}
            className={errors.deliveryLocation ? 'GOPL-error' : ''}
          />
          {errors.deliveryLocation && <span className="GOPL-error-message">{errors.deliveryLocation}</span>}
        </div>

        <div className="GOPL-form-row">
          <div className="GOPL-form-group">
            <label>Pickup Date</label>
            <input
              type="date"
              name="pickupDate"
              value={formData.pickupDate}
              onChange={handleChange}
              className={errors.pickupDate ? 'GOPL-error' : ''}
            />
            {errors.pickupDate && <span className="GOPL-error-message">{errors.pickupDate}</span>}
          </div>

          <div className="GOPL-form-group">
            <label>Delivery Date</label>
            <input
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
              className={errors.deliveryDate ? 'GOPL-error' : ''}
            />
            {errors.deliveryDate && <span className="GOPL-error-message">{errors.deliveryDate}</span>}
          </div>
        </div>

        <div className="GOPL-form-group">
          <label>Description (Optional)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="GOPL-form-group">
          <label>Expected Price (₹)</label>
          <input
            type="number"
            name="expectedPrice"
            value={formData.expectedPrice}
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post Load'}
        </button>
      </form>
    </div>
  );
};

export default PostLoad;
