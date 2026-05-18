import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle } from 'lucide-react';
import './LowStock.css';

const LowStock = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/products/notifications');
      setLowStockProducts(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="low-stock-page">
      <div className="page-header">
        <div>
          <h1>Low Stock Alerts</h1>
          <p>The following products have reached or fallen below their order quantity</p>
        </div>
      </div>

      <div className="grid-container">
        {lowStockProducts.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Model #</th>
                <th>Brand</th>
                <th>Location</th>
                <th>Supplier</th>
                <th>Current Qty</th>
                <th>Order Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map((p) => (
                <tr key={p._id}>
                  <td><span className="badge-model">{p.modelNumber}</span></td>
                  <td>{p.brand?.name}</td>
                  <td><span className="location-tag">{p.location?.name}</span></td>
                  <td>{p.vendor?.name}</td>
                  <td>
                    <span className="qty-pill qty-low">
                      {p.quantity}
                    </span>
                  </td>
                  <td>{p.orderQuantity}</td>
                  <td>
                    <div className="status-alert">
                      <AlertTriangle size={16} />
                      <span>Action Needed</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No low stock products found. Your inventory is healthy!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStock;
