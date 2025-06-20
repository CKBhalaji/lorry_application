import React from 'react';

const EditModal = ({ admin, onClose, onSave, children }) => (
  <div className="edit-modal-overlay">
    <div className="edit-modal">
      <h3>Edit Admin</h3>
      {children}
      <div className="modal-actions">
        <button type="button" onClick={onClose}>Cancel</button>
        <button type="submit" onClick={() => onSave(admin)}>Save</button>
      </div>
    </div>
  </div>
);

export default EditModal;