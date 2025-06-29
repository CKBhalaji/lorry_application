// src/components/admin/LoadManagement.js
import React, { useState, useEffect } from 'react';
import './LoadManagement.css';
import { fetchAllLoads, updateLoadStatus } from '../../services/adminService';

const LoadManagement = () => {
  const [allLoadsData, setAllLoadsData] = useState([]); // Stores all fetched loads
  const [filteredLoads, setFilteredLoads] = useState([]); // Stores loads to be displayed after filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [filter, setFilter] = useState('all'); // This state seems unused, selectedStatus in handleFilter is used
  const [selectedLoad, setSelectedLoad] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // console.log('LoadManagement: Fetching all loads.');
        const data = await fetchAllLoads();
        // console.log('LoadManagement: Successfully fetched data:', data);
        if (!Array.isArray(data)) {
          // console.error('LoadManagement: Data is not an array!', data);
          throw new Error('Received invalid data format from server for loads.');
        }
        setAllLoadsData(data || []);
        setFilteredLoads(data || []); // Initialize filtered loads with all data
      } catch (err) {
        // console.error('LoadManagement: Detailed error fetching loads:', err);
        setError(err.message || 'Failed to fetch loads. Please check console for details.');
        setAllLoadsData([]);
        setFilteredLoads([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleStatusChange = async (loadId, newStatus) => {
    try {
      // console.log(`LoadManagement: Updating status for load ID ${loadId} to ${newStatus}.`);
      await updateLoadStatus(loadId, newStatus);
      // Update local state after successful API call
      const updatedLoads = allLoadsData.map(load =>
        load.id === loadId ? { ...load, status: newStatus } : load
      );
      setAllLoadsData(updatedLoads);
      // Re-apply current filter to the updated list
      // This assumes a filter state or re-calls handleFilter with current filter criteria
      // For simplicity, if a filter is active, we might need to re-filter here.
      // Or, if handleFilter uses a state for selectedStatus, it will be simpler.
      // Let's assume selectedStatus is available via a state or re-evaluate filter
      const currentFilterValue = document.querySelector('.LM-filter-controls select').value; // Example to get current filter
      handleFilter(currentFilterValue, updatedLoads); // Pass updatedLoads to filter on
      // console.log(`LoadManagement: Status updated for load ID ${loadId}.`);
    } catch (err) {
      // console.error('LoadManagement: Error updating load status:', err);
      setError(err.message || `Failed to update status for load ${loadId}.`);
    }
  };

  const handleFilter = (selectedStatus, sourceLoads = allLoadsData) => {
    // setFilter(selectedStatus); // if filter state was used
    if (selectedStatus === "all") {
      setFilteredLoads(sourceLoads);
    } else {
      const filtered = sourceLoads.filter(load => load.status && load.status.toLowerCase() === selectedStatus.toLowerCase());
      setFilteredLoads(filtered);
    }
  };

  const handleViewDetails = (load) => {
    setSelectedLoad(load);
  };

  if (loading) return <div className="LM-loading">Loading loads...</div>;
  if (error) return <div className="LM-error-message">{error}</div>;

  return (
    <div className="LM-load-management">
      <div className="LM-management-header">
        <h2>Load Management</h2>
        <div className="LM-filter-controls">
          <label>Filter by status:</label>
          <select onChange={(e) => handleFilter(e.target.value, allLoadsData)}>
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
          <p><strong>ID:</strong> {selectedLoad.id || 'N/A'}</p>
          <p><strong>Goods Type:</strong> {selectedLoad.goodsType || 'N/A'}</p>
          <p><strong>Route:</strong> {selectedLoad.pickupLocation || 'N/A'} to {selectedLoad.deliveryLocation || 'N/A'}</p>
          <p><strong>Owner:</strong> {selectedLoad.owner_id || 'N/A'}</p>
          <p><strong>Status:</strong> {selectedLoad.status || 'N/A'}</p>
          {/* Add more details if available in selectedLoad */}
          <p><strong>Current Lowest Bid:</strong> {selectedLoad.current_lowest_bid !== undefined ? selectedLoad.current_lowest_bid : 'N/A'}</p>
          <p><strong>Expected Price:</strong> {selectedLoad.expectedPrice !== undefined && selectedLoad.expectedPrice !== null ? selectedLoad.expectedPrice : 'N/A'}</p>
          <p><strong>Driver::</strong> {selectedLoad.accepted_driver_id || 'N/A'}</p>
          <button onClick={() => setSelectedLoad(null)}>Close</button>
        </div>
      )}

      {!loading && !error && filteredLoads.length === 0 ? (
        <div className="LM-no-results">No loads found for the selected filter.</div>
      ) : (
        <div className="LM-table-container">
          <table className="LM-loads-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Goods Type</th>
                <th>Route</th>
                <th>Owner</th>
                <th>Current Lowest Bid</th>
                <th>Expected Price</th>
                <th>Driver ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoads.map((load, index) => {
                try {
                  if (!load || typeof load !== 'object') {
                    // console.error(`LoadManagement: Invalid load item at index ${index}:`, load);
                    return (
                      <tr key={`error-${index}`} className="error-row">
                        <td colSpan="7">Invalid load data</td>
                      </tr>
                    );
                  }
                  const id = load.id || `missing-id-${index}`;
                  const goodsType = load.goodsType || 'N/A';
                  const pickupLocation = load.pickupLocation || 'N/A';
                  const deliveryLocation = load.deliveryLocation || 'N/A';
                  const ownerId = load.owner_id || 'N/A';
                  const currentLowestBid = load.current_lowest_bid !== undefined ? load.current_lowest_bid : 'N/A';
                  const expectedPrice = load.expectedPrice !== undefined && load.expectedPrice !== null ? load.expectedPrice : 'N/A';
                  const driverId = load.accepted_driver_id || 'N/A';
                  const status = load.status || 'N/A';

                  return (
                    <tr key={id} >
                      <td onClick={() => handleViewDetails(load)}>{id}</td>
                      <td onClick={() => handleViewDetails(load)}>{goodsType}</td>
                      <td onClick={() => handleViewDetails(load)}>{pickupLocation} → {deliveryLocation}</td>
                      <td onClick={() => handleViewDetails(load)}>{ownerId}</td>
                      <td onClick={() => handleViewDetails(load)}>{currentLowestBid}</td>
                      <td onClick={() => handleViewDetails(load)}>{expectedPrice}</td>
                      <td onClick={() => handleViewDetails(load)}>{load.accepted_driver_id ? load.accepted_driver_id : 'N/A'}</td>
                      <td>
                        <select
                          value={status}
                          onChange={(e) => handleStatusChange(id, e.target.value)}
                          className={`LM-status-select LM-status-badge ${status.toLowerCase()}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button className="LM-view-btn" onClick={() => handleViewDetails(load)}>Details</button>
                      </td>
                    </tr>
                  );
                } catch (cardError) {
                  // console.error(`LoadManagement: Error rendering load row for load at index ${index}:`, load, cardError);
                  return (
                    <tr key={load && load.id ? `error-${load.id}` : `error-idx-${index}`} className="error-row">
                      <td colSpan="7">Error displaying this load.</td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LoadManagement;