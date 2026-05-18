import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Upload, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MetadataModal from '../components/MetadataModal';
import Pagination from '../components/Pagination';
import './Management.css';

const Management = ({ type, title, columns, endpoint }) => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { user } = useAuth();
  const isAdmin = user?.capability === 'admin';
  const entity = endpoint.slice(0, -1);
  const canAdd = isAdmin || user?.permissions?.[`${entity}_add`];
  const canEdit = isAdmin || user?.permissions?.[`${entity}_update`];
  const canDelete = isAdmin || user?.permissions?.[`${entity}_delete`];

  useEffect(() => {
    fetchItems();
  }, [endpoint]);

  const fetchItems = async () => {
    const { data } = await axios.get(`http://localhost:5000/api/metadata/${endpoint}`);
    setItems(data);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      await axios.delete(`http://localhost:5000/api/metadata/${endpoint}/${id}`);
      fetchItems();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(`http://localhost:5000/api/metadata/${endpoint}/upload`, formData);
      alert('Upload successful');
      fetchItems();
    } catch (err) {
      alert('Upload failed');
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/metadata/${endpoint}/template`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${endpoint}_template.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Error downloading template');
    }
  };

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="management-page">
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p>Manage your {title.toLowerCase()}</p>
        </div>
        {canAdd && (
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={downloadTemplate}>
              <FileSpreadsheet size={20} />
              <span>Template</span>
            </button>
            <label className="btn btn-secondary">
              <Upload size={20} />
              <span>Excel Upload</span>
              <input type="file" hidden onChange={handleFileUpload} accept=".xlsx, .xls" />
            </label>
            <button className="btn btn-primary" onClick={() => { setCurrentItem(null); setShowModal(true); }}>
              <Plus size={20} />
              <span>Add {type}</span>
            </button>
          </div>
        )}
      </div>

      <MetadataModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        type={type}
        title={title}
        columns={columns}
        endpoint={endpoint}
        item={currentItem}
        refresh={fetchItems}
      />

      <div className="grid-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => <th key={col.key}>{col.label}</th>)}
              {(canEdit || canDelete) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(item => (
              <tr key={item._id}>
                {columns.map(col => <td key={col.key}>{item[col.key]}</td>)}
                {(canEdit || canDelete) && (
                  <td>
                    <div className="actions">
                      {canEdit && <button className="action-btn edit" onClick={() => { setCurrentItem(item); setShowModal(true); }}><Edit2 size={16} /></button>}
                      {canDelete && <button className="action-btn delete" onClick={() => handleDelete(item._id)}><Trash2 size={16} /></button>}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Management;
