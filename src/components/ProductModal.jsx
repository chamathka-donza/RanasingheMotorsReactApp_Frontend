import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Upload } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import './ProductModal.css';

const ProductModal = ({ isOpen, onClose, product, refresh }) => {
  const [formData, setFormData] = useState({
    modelNumber: '',
    brand: '',
    description: '',
    manufactureCountry: '',
    teethQuantity: '',
    size: '',
    engineModel: '',
    vehicle: '',
    location: '',
    vendor: '',
    sellingPrice: '',
    buyingPrice: '',
    orderQuantity: 0,
    quantity: 0,
    isRack: false,
    image: ''
  });

  const { refreshNotifs } = useNotifications();
  const [brands, setBrands] = useState([]);
  const [locations, setLocations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMetadata();
      if (product) {
        setFormData({
          ...product,
          brand: product.brand?._id || product.brand,
          location: product.location?._id || product.location,
          vendor: product.vendor?._id || product.vendor,
        });
      } else {
        setFormData({
          modelNumber: '', brand: '', description: '', manufactureCountry: '',
          teethQuantity: '', size: '', engineModel: '', vehicle: '',
          location: '', vendor: '', sellingPrice: '', buyingPrice: '',
          orderQuantity: 0, quantity: 0, isRack: false, image: ''
        });
      }
    }
  }, [isOpen, product]);

  const fetchMetadata = async () => {
    const [b, l, s] = await Promise.all([
      axios.get('http://localhost:5000/api/metadata/brands'),
      axios.get('http://localhost:5000/api/metadata/locations'),
      axios.get('http://localhost:5000/api/metadata/suppliers')
    ]);
    setBrands(b.data);
    setLocations(l.data);
    setSuppliers(s.data);
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formDataFile = new FormData();
    formDataFile.append('image', file);
    setUploading(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post('http://localhost:5000/api/upload', formDataFile, config);
      setFormData({ ...formData, image: data });
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (product?._id) {
        await axios.put(`http://localhost:5000/api/products/${product._id}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/products', formData);
      }
      refreshNotifs();
      refresh();
      onClose();
    } catch (err) {
      alert('Error saving product');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in">
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="close-btn"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Model Number *</label>
              <input type="text" value={formData.modelNumber} onChange={(e) => setFormData({...formData, modelNumber: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Brand *</label>
              <select value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} required>
                <option value="">Select Brand</option>
                {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-group full-width">
              <label>Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Manufacture Country</label>
              <input type="text" value={formData.manufactureCountry} onChange={(e) => setFormData({...formData, manufactureCountry: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Teeth Quantity</label>
              <input type="text" value={formData.teethQuantity} onChange={(e) => setFormData({...formData, teethQuantity: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Size</label>
              <input type="text" value={formData.size} onChange={(e) => setFormData({...formData, size: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Engine Model</label>
              <input type="text" value={formData.engineModel} onChange={(e) => setFormData({...formData, engineModel: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Vehicle</label>
              <input type="text" value={formData.vehicle} onChange={(e) => setFormData({...formData, vehicle: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Location *</label>
              <select value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} required>
                <option value="">Select Location</option>
                {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Supplier *</label>
              <select value={formData.vendor} onChange={(e) => setFormData({...formData, vendor: e.target.value})} required>
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Buying Price (Code) *</label>
              <input type="text" value={formData.buyingPrice} onChange={(e) => setFormData({...formData, buyingPrice: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Selling Price (Code) *</label>
              <input type="text" value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Order Quantity (Low Stock Alert)</label>
              <input type="number" value={formData.orderQuantity} onChange={(e) => setFormData({...formData, orderQuantity: e.target.value})} />
            </div>
            <div className="form-group checkbox">
              <label>
                <input type="checkbox" checked={formData.isRack} onChange={(e) => setFormData({...formData, isRack: e.target.checked})} />
                <span>Is Rack</span>
              </label>
            </div>
            <div className="form-group">
              <label>Image</label>
              <input type="file" onChange={uploadFileHandler} />
              {uploading && <p>Uploading...</p>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
