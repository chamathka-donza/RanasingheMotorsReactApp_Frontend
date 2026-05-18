import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    shopName: '',
    address: '',
    contact: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await axios.get('http://localhost:5000/api/settings');
    setSettings(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/settings', settings);
      setMsg('Settings updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert('Error updating settings');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Shop Settings</h1>
        <p>Update your business details shown in the system</p>
      </div>

      <div className="settings-card">
        <form onSubmit={handleSubmit}>
          {msg && <div className="success-banner">{msg}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label>Shop Name</label>
              <input 
                type="text" 
                value={settings.shopName} 
                onChange={(e) => setSettings({...settings, shopName: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Shop Contact</label>
              <input 
                type="text" 
                value={settings.contact} 
                onChange={(e) => setSettings({...settings, contact: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Shop Email</label>
              <input 
                type="email" 
                value={settings.email} 
                onChange={(e) => setSettings({...settings, email: e.target.value})}
              />
            </div>
            <div className="form-group full-width">
              <label>Shop Address</label>
              <textarea 
                rows="3"
                value={settings.address} 
                onChange={(e) => setSettings({...settings, address: e.target.value})}
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              <Save size={20} />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
