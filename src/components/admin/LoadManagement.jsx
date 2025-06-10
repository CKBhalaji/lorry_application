// src/components/admin/LoadManagement.js
import React, { useState, useEffect } from 'react';
import './LoadManagement.css';
import { fetchAllLoads, updateLoadStatus } from '../../services/adminService';

const LoadManagement = () => {
  // const [loads, setLoads] = useState([]);
  const loads = [
    {
      id: 1,
      goodsType: 'Electronics',
      pickupLocation: 'New York',
      deliveryLocation: 'Los Angeles',
      ownerName: 'John Doe',
      bidCount: 3,
      status: 'pending'
    },
    {
      id: 2,
      goodsType: 'Furniture',
      pickupLocation: 'Chicago',
      deliveryLocation: 'Houston',
      ownerName: 'Jane Smith',
      bidCount: 5,
      status: 'active'
    },
    {
      id: 3,
      goodsType: 'Clothing',
      pickupLocation: 'Miami',
      deliveryLocation: 'Seattle',
      ownerName: 'Mike Johnson',
      bidCount: 2,
      status: 'completed'
    },
    {
      id: 4,
      goodsType: 'Clothing',
      pickupLocation: 'Miami',
      deliveryLocation: 'Seattle',
      ownerName: 'Mike Johnson',
      bidCount: 2,
      status: 'cancelled'
    }
  ];
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAllLoads();
        setLoads(data);
      } catch (error) {
        console.error('Error fetching loads:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleStatusChange = async (loadId, newStatus) => {
    try {
      await updateLoadStatus(loadId, newStatus);
      setLoads(loads.map(load =>
        load.id === loadId ? { ...load, status: newStatus } : load
      ));
    } catch (error) {
      console.error('Error updating load status:', error);
    }
  };

  // const filteredLoads = Array.isArray(loads) ? (filter === 'all'
  //   ? loads
  //   : loads.filter(load => load.status === filter)) : [];

  const [filteredLoads, setFilteredLoads] = useState(loads);

  const handleFilter = (selectedStatus) => {
    if (selectedStatus === "all") {
      setFilteredLoads(loads);
    } else {
      const filtered = loads.filter(load => load.status.toLowerCase() === selectedStatus.toLowerCase());
      setFilteredLoads(filtered);
    }
  };

  const[selectedLoad, setSelectedLoad] = useState(null);

  const handleViewDetails = (load) => {
    setSelectedLoad(load);
  };

  if (loading) return <div className="LM-loading">Loading loads...</div>;

  return (
    <div className="LM-load-management">
      <div className="LM-management-header">
        <h2>Load Management</h2>
        <div className="LM-filter-controls">
          <label>Filter by status:</label>
          <select onChange={(e) => handleFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {selectedLoad && (
        <div className="LM-load-details-card">
          <h3>Load Details</h3>
          <p><strong>ID:</strong> {selectedLoad.id}</p>
          <p><strong>Goods Type:</strong> {selectedLoad.goodsType}</p>
          <p><strong>Route:</strong> {selectedLoad.pickupLocation} to {selectedLoad.deliveryLocation}</p>
          <p><strong>Owner:</strong> {selectedLoad.ownerName}</p>
          <p><strong>Status:</strong> {selectedLoad.status}</p>
          <button onClick={() => setSelectedLoad(null)}>Close</button>
        </div>
      )}

      {filteredLoads.length === 0 ? (
        <div className="LM-no-results">No loads found</div>
      ) : (
        <div className="LM-table-container">
          <table className="LM-loads-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Goods Type</th>
                <th>Route</th>
                <th>Owner</th>
                <th>Bids</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoads.map(load => (
                <tr key={load.id} onClick={() => handleViewDetails(load)}>
                  <td>{load.id}</td>
                  <td>{load.goodsType}</td>
                  <td>{load.pickupLocation} → {load.deliveryLocation}</td>
                  <td>{load.ownerName}</td>
                  <td>{load.bidCount}</td>
                  <td>
                    <span className={`LM-status-badge ${load.status}`}>
                      {load.status}
                    </span>
                  </td>
                  <td>
                    <button className="LM-view-btn">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LoadManagement;