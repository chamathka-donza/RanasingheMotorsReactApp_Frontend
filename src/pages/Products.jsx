import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Minus, Edit2, Trash2, AlertCircle, Upload, FileSpreadsheet, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProductModal from '../components/ProductModal';
import Pagination from '../components/Pagination';
import { useNotifications } from '../context/NotificationContext';
import './Products.css';
import './ProductsSearch.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { user } = useAuth();
  const { refreshNotifs } = useNotifications();
  const isAdmin = user?.capability === 'admin';
  const canAdd = isAdmin || user?.permissions?.product_add;
  const canEdit = isAdmin || user?.permissions?.product_update;
  const canDelete = isAdmin || user?.permissions?.product_delete;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchProducts();
    fetchNotifications();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/products');
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/products/notifications');
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post('http://localhost:5000/api/products/upload', formData);
      alert('Products uploaded successfully');
      refreshNotifs();
      fetchProducts();
      fetchNotifications();
    } catch (err) {
      alert('Upload failed. Ensure Brand, Location, and Supplier names match existing records.');
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'product_template.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Error downloading template');
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        refreshNotifs();
        fetchProducts();
      } catch (err) {
        alert('Error deleting product');
      }
    }
  };

  const handleQuantityChange = async (product, change) => {
    const newQuantity = product.quantity + change;
    if (newQuantity < 0) return; // Prevent negative quantity

    // Optimistically update UI
    setProducts(prevProducts => 
      prevProducts.map(p => p._id === product._id ? { ...p, quantity: newQuantity } : p)
    );

    try {
      await axios.put(`http://localhost:5000/api/products/${product._id}`, { quantity: newQuantity });
      refreshNotifs();
      fetchNotifications();
    } catch (err) {
      // Revert on failure
      fetchProducts();
      alert('Error updating quantity');
    }
  };

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.modelNumber?.toLowerCase().includes(q) ||
      p.brand?.name?.toLowerCase().includes(q) ||
      p.engineModel?.toLowerCase().includes(q) ||
      p.vehicle?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p>Manage and track your spare parts</p>
        </div>
        <div className="header-controls">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search model, brand, engine, vehicle..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
              <button className="btn btn-primary" onClick={() => { setCurrentProduct(null); setIsModalOpen(true); }}>
                <Plus size={20} />
                <span>Add Product</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={currentProduct}
        refresh={() => { fetchProducts(); fetchNotifications(); }}
      />

      {notifications.length > 0 && (
        <div className="notifications-banner">
          <AlertCircle size={20} />
          <span>{notifications.length} products are low in stock!</span>
        </div>
      )}

      <div className="grid-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Model #</th>
              <th>Brand</th>
              <th>Description</th>
              <th>Manufacture</th>
              <th>Teeth</th>
              <th>Size</th>
              <th>Engine</th>
              <th>Vehicle</th>
              <th>Location</th>
              <th>Buy Code</th>
              <th>Sell Code</th>
              <th>Qty</th>
              {(canEdit || canDelete) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((p) => (
              <tr key={p._id} className={p.quantity <= p.orderQuantity ? 'low-stock' : ''}>
                <td>
                  <div className="product-img">
                    {p.image ? <img src={`${window.API_URL || 'http://localhost:5000'}${p.image}`} alt="" /> : <div className="placeholder" />}
                  </div>
                </td>
                <td><span className="badge-model">{p.modelNumber}</span></td>
                <td>{p.brand?.name}</td>
                <td className="truncate">{p.description}</td>
                <td>{p.manufactureCountry}</td>
                <td>{p.teethQuantity}</td>
                <td>{p.size}</td>
                <td>{p.engineModel}</td>
                <td>{p.vehicle}</td>
                <td><span className="location-tag">{p.location?.name}</span></td>
                <td><code>{p.buyingPrice}</code></td>
                <td><code>{p.sellingPrice}</code></td>
                <td>
                  <div className="qty-adjuster">
                    {canEdit && (
                      <button 
                        className="qty-btn minus" 
                        onClick={() => handleQuantityChange(p, -1)}
                        disabled={p.quantity <= 0}
                      >
                        <Minus size={14} />
                      </button>
                    )}
                    <span className={`qty-pill ${p.quantity <= p.orderQuantity ? 'qty-low' : ''}`}>
                      {p.quantity}
                    </span>
                    {canEdit && (
                      <button 
                        className="qty-btn plus" 
                        onClick={() => handleQuantityChange(p, 1)}
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                </td>
                {(canEdit || canDelete) && (
                  <td>
                    <div className="actions">
                      {canEdit && <button className="action-btn edit" onClick={() => { setCurrentProduct(p); setIsModalOpen(true); }}><Edit2 size={16} /></button>}
                      {canDelete && <button className="action-btn delete" onClick={() => deleteProduct(p._id)}><Trash2 size={16} /></button>}
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

export default Products;
