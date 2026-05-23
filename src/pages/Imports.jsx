import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Search, Ship, Users, X, FileSpreadsheet, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Imports.css';
import '../components/ProductModal.css'; // Import global modal styles

const Imports = () => {
  const [imports, setImports] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [activeTab, setActiveTab] = useState('imports'); // 'imports' or 'suppliers'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  
  // Forms state
  const [currentImport, setCurrentImport] = useState(null);
  const [currentSupplier, setCurrentSupplier] = useState(null);

  const { user } = useAuth();
  const isAdmin = user?.capability === 'admin';

  // Permissions
  const canViewImports = isAdmin || user?.permissions?.import_view;
  const canAddImport = isAdmin || user?.permissions?.import_add;
  const canEditImport = isAdmin || user?.permissions?.import_update;
  const canDeleteImport = isAdmin || user?.permissions?.import_delete;

  const canViewSuppliers = isAdmin || user?.permissions?.importSupplier_view;
  const canAddSupplier = isAdmin || user?.permissions?.importSupplier_add;
  const canEditSupplier = isAdmin || user?.permissions?.importSupplier_update;
  const canDeleteSupplier = isAdmin || user?.permissions?.importSupplier_delete;

  useEffect(() => {
    if (canViewImports) fetchImports();
    if (canViewSuppliers) fetchSuppliers();
  }, [canViewImports, canViewSuppliers]);

  const fetchImports = async () => {
    try {
      const { data } = await axios.get(`${window.API_URL || 'http://localhost:5000'}/api/imports`);
      setImports(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data } = await axios.get(`${window.API_URL || 'http://localhost:5000'}/api/importSuppliers`);
      setSuppliers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportToggle = async (id, field, value) => {
    try {
      // Optimistically update
      setImports(prev => prev.map(imp => imp._id === id ? { ...imp, [field]: value } : imp));
      await axios.put(`${window.API_URL || 'http://localhost:5000'}/api/imports/${id}`, { [field]: value });
    } catch (err) {
      fetchImports(); // Revert on error
      alert('Error updating import status');
    }
  };

  const handleImportFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(`${window.API_URL || 'http://localhost:5000'}/api/imports/upload`, formData);
      alert('Imports uploaded successfully');
      fetchImports();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed. Ensure suppliers match existing records.');
    }
  };

  const downloadImportTemplate = async () => {
    try {
      const response = await axios.get(`${window.API_URL || 'http://localhost:5000'}/api/imports/template`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'imports_template.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Error downloading template');
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.isCashPaid = formData.get('isCashPaid') === 'on';
    data.isGoodsArrived = formData.get('isGoodsArrived') === 'on';

    try {
      if (currentImport) {
        await axios.put(`${window.API_URL || 'http://localhost:5000'}/api/imports/${currentImport._id}`, data);
      } else {
        await axios.post(`${window.API_URL || 'http://localhost:5000'}/api/imports`, data);
      }
      setIsImportModalOpen(false);
      fetchImports();
    } catch (err) {
      alert('Error saving import');
    }
  };

  const deleteImport = async (id) => {
    if (window.confirm('Delete this import record?')) {
      await axios.delete(`${window.API_URL || 'http://localhost:5000'}/api/imports/${id}`);
      fetchImports();
    }
  };

  const handleSupplierSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      if (currentSupplier) {
        await axios.put(`${window.API_URL || 'http://localhost:5000'}/api/importSuppliers/${currentSupplier._id}`, data);
      } else {
        await axios.post(`${window.API_URL || 'http://localhost:5000'}/api/importSuppliers`, data);
      }
      setIsSupplierModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      alert('Error saving supplier');
    }
  };

  const handleSupplierFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(`${window.API_URL || 'http://localhost:5000'}/api/importSuppliers/upload`, formData);
      alert('Suppliers uploaded successfully');
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed.');
    }
  };

  const downloadSupplierTemplate = async () => {
    try {
      const response = await axios.get(`${window.API_URL || 'http://localhost:5000'}/api/importSuppliers/template`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'import_suppliers_template.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Error downloading template');
    }
  };

  const deleteSupplier = async (id) => {
    if (window.confirm('Delete this supplier?')) {
      await axios.delete(`${window.API_URL || 'http://localhost:5000'}/api/importSuppliers/${id}`);
      fetchSuppliers();
    }
  };

  const filteredImports = imports.filter(imp => {
    const term = searchTerm.toLowerCase();
    return (
      (imp.yNumber && imp.yNumber.toLowerCase().includes(term)) ||
      (imp.items && imp.items.toLowerCase().includes(term)) ||
      (imp.supplier?.name && imp.supplier.name.toLowerCase().includes(term))
    );
  });

  const filteredSuppliers = suppliers.filter(sup => 
    sup.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="imports-page">
      <div className="page-header">
        <div>
          <h1>Imports Management</h1>
          <p>Track shipments, arrival dates, and import suppliers</p>
        </div>
        <div className="header-controls">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="header-actions">
            {activeTab === 'imports' && canAddImport && (
              <>
                <button className="btn btn-secondary" onClick={downloadImportTemplate}>
                  <FileSpreadsheet size={20} />
                  <span className="hide-on-mobile">Template</span>
                </button>
                <label className="btn btn-secondary">
                  <Upload size={20} />
                  <span className="hide-on-mobile">Excel Upload</span>
                  <input type="file" hidden onChange={handleImportFileUpload} accept=".xlsx, .xls" />
                </label>
                <button className="btn btn-primary" onClick={() => { setCurrentImport(null); setIsImportModalOpen(true); }}>
                  <Plus size={20} /> <span className="hide-on-mobile">Add Shipment</span>
                </button>
              </>
            )}
            {activeTab === 'suppliers' && canAddSupplier && (
              <>
                <button className="btn btn-secondary" onClick={downloadSupplierTemplate}>
                  <FileSpreadsheet size={20} />
                  <span className="hide-on-mobile">Template</span>
                </button>
                <label className="btn btn-secondary">
                  <Upload size={20} />
                  <span className="hide-on-mobile">Excel Upload</span>
                  <input type="file" hidden onChange={handleSupplierFileUpload} accept=".xlsx, .xls" />
                </label>
                <button className="btn btn-primary" onClick={() => { setCurrentSupplier(null); setIsSupplierModalOpen(true); }}>
                  <Plus size={20} /> <span className="hide-on-mobile">Add Supplier</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="tabs-container">
        {canViewImports && (
          <button 
            className={`tab-btn ${activeTab === 'imports' ? 'active' : ''}`}
            onClick={() => setActiveTab('imports')}
          >
            <Ship size={18} />
            <span>Shipments</span>
          </button>
        )}
        {canViewSuppliers && (
          <button 
            className={`tab-btn ${activeTab === 'suppliers' ? 'active' : ''}`}
            onClick={() => setActiveTab('suppliers')}
          >
            <Users size={18} />
            <span>Import Suppliers</span>
          </button>
        )}
      </div>

      {activeTab === 'imports' && canViewImports && (
        <>
          <div className="grid-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order Date</th>
                  <th>Supplier</th>
                  <th>Y Number</th>
                  <th>Items</th>
                  <th>Qty</th>
                  <th>Cash Paid</th>
                  <th>Status</th>
                  {(canEditImport || canDeleteImport) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredImports.map(imp => (
                  <tr key={imp._id}>
                    <td>{imp.orderDate ? new Date(imp.orderDate).toLocaleDateString() : '-'}</td>
                    <td><span className="location-tag">{imp.supplier?.name}</span></td>
                    <td><span className="badge-model">{imp.yNumber}</span></td>
                    <td className="truncate" title={imp.items}>{imp.items}</td>
                    <td>{imp.quantity}</td>
                    <td>
                      <div className="toggle-group status-group">
                        <label className="switch" title={canEditImport ? "Toggle Payment Status" : ""}>
                          <input 
                            type="checkbox" 
                            checked={imp.isCashPaid} 
                            disabled={!canEditImport}
                            onChange={(e) => handleImportToggle(imp._id, 'isCashPaid', e.target.checked)}
                          />
                          <span className="slider round"></span>
                        </label>
                        <span className="highlight-amount">{imp.cashPaidAmount || '0'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="toggle-group status-group">
                        <label className="switch" title={canEditImport ? "Toggle Arrival Status" : ""}>
                          <input 
                            type="checkbox" 
                            checked={imp.isGoodsArrived} 
                            disabled={!canEditImport}
                            onChange={(e) => handleImportToggle(imp._id, 'isGoodsArrived', e.target.checked)}
                          />
                          <span className="slider round"></span>
                        </label>
                        <div className="arrival-details">
                          <span className={imp.isGoodsArrived ? 'status-arrived highlight-status' : 'status-pending highlight-status'}>
                            {imp.isGoodsArrived ? 'Arrived' : 'Pending'}
                          </span>
                          {imp.arrivedDate && <span className="highlight-date">{new Date(imp.arrivedDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </td>
                    {(canEditImport || canDeleteImport) && (
                      <td>
                        <div className="actions">
                          {canEditImport && <button className="action-btn edit" onClick={() => { setCurrentImport(imp); setIsImportModalOpen(true); }}><Edit2 size={16} /></button>}
                          {canDeleteImport && <button className="action-btn delete" onClick={() => deleteImport(imp._id)}><Trash2 size={16} /></button>}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'suppliers' && canViewSuppliers && (
        <>
          <div className="grid-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Supplier Name</th>
                  <th>Email</th>
                  <th>WhatsApp No.</th>
                  {(canEditSupplier || canDeleteSupplier) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map(sup => (
                  <tr key={sup._id}>
                    <td>{sup.name}</td>
                    <td>{sup.email || '-'}</td>
                    <td>{sup.whatsappNumber || '-'}</td>
                    {(canEditSupplier || canDeleteSupplier) && (
                      <td>
                        <div className="actions">
                          {canEditSupplier && <button className="action-btn edit" onClick={() => { setCurrentSupplier(sup); setIsSupplierModalOpen(true); }}><Edit2 size={16} /></button>}
                          {canDeleteSupplier && <button className="action-btn delete" onClick={() => deleteSupplier(sup._id)}><Trash2 size={16} /></button>}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h2>{currentImport ? 'Edit Shipment' : 'Add Shipment'}</h2>
              <button type="button" onClick={() => setIsImportModalOpen(false)} className="close-btn"><X size={24} /></button>
            </div>
            <form onSubmit={handleImportSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Order Date</label>
                  <input type="date" name="orderDate" defaultValue={currentImport?.orderDate ? currentImport.orderDate.split('T')[0] : ''} />
                </div>
                <div className="form-group">
                  <label>Supplier *</label>
                  <select name="supplier" defaultValue={currentImport?.supplier?._id || currentImport?.supplier || ''} required>
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Y Number</label>
                  <input type="text" name="yNumber" defaultValue={currentImport?.yNumber} />
                </div>
                <div className="form-group full-width">
                  <label>Items (Product Names) *</label>
                  <input type="text" name="items" defaultValue={currentImport?.items} required />
                </div>
                <div className="form-group">
                  <label>Total Quantity</label>
                  <input type="number" name="quantity" defaultValue={currentImport?.quantity} />
                </div>
                <div className="form-group">
                  <label>Cash Paid Amount</label>
                  <input type="text" name="cashPaidAmount" defaultValue={currentImport?.cashPaidAmount} />
                </div>
                <div className="form-group">
                  <label>Arrived Date</label>
                  <input type="date" name="arrivedDate" defaultValue={currentImport?.arrivedDate ? currentImport.arrivedDate.split('T')[0] : ''} />
                </div>
                <div className="form-group full-width toggle-row">
                  <label className="switch-label">
                    <input type="checkbox" name="isCashPaid" defaultChecked={currentImport?.isCashPaid} />
                    Cash Paid
                  </label>
                  <label className="switch-label">
                    <input type="checkbox" name="isGoodsArrived" defaultChecked={currentImport?.isGoodsArrived} />
                    Goods Arrived
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsImportModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Shipment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in small-modal">
            <div className="modal-header">
              <h2>{currentSupplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
              <button type="button" onClick={() => setIsSupplierModalOpen(false)} className="close-btn"><X size={24} /></button>
            </div>
            <form onSubmit={handleSupplierSubmit}>
              <div className="form-container" style={{ padding: '0 2rem' }}>
                <div className="form-group full-width">
                  <label>Supplier Name *</label>
                  <input type="text" name="name" defaultValue={currentSupplier?.name} required />
                </div>
                <div className="form-group full-width">
                  <label>Email</label>
                  <input type="email" name="email" defaultValue={currentSupplier?.email} />
                </div>
                <div className="form-group full-width">
                  <label>WhatsApp Number</label>
                  <input type="text" name="whatsappNumber" defaultValue={currentSupplier?.whatsappNumber} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsSupplierModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Imports;
