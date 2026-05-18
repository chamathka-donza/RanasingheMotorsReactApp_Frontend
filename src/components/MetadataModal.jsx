import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import './MetadataModal.css';

const MetadataModal = ({ isOpen, onClose, type, title, columns, endpoint, item, refresh }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData(item);
      } else {
        const initialData = {};
        columns.forEach(col => initialData[col.key] = '');
        setFormData(initialData);
      }
    }
  }, [isOpen, item, columns]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (item?._id) {
        await axios.put(`http://localhost:5000/api/metadata/${endpoint}/${item._id}`, formData);
      } else {
        await axios.post(`http://localhost:5000/api/metadata/${endpoint}`, formData);
      }
      refresh();
      onClose();
    } catch (err) {
      alert('Error saving data');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in small-modal">
        <div className="modal-header">
          <h2>{item ? `Edit ${type}` : `Add New ${type}`}</h2>
          <button onClick={onClose} className="close-btn"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-container">
            {columns.map(col => (
              <div className="form-group" key={col.key}>
                <label>{col.label} *</label>
                {col.key === 'description' || col.key === 'address' ? (
                  <textarea 
                    value={formData[col.key] || ''} 
                    onChange={(e) => setFormData({...formData, [col.key]: e.target.value})}
                    required
                  />
                ) : (
                  <input 
                    type="text" 
                    value={formData[col.key] || ''} 
                    onChange={(e) => setFormData({...formData, [col.key]: e.target.value})}
                    required
                  />
                )}
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save {type}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MetadataModal;
