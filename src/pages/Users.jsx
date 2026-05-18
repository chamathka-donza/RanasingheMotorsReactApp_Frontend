import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Shield, User as UserIcon, Trash2 } from 'lucide-react';
import './Users.css';
import './Permissions.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [capability, setCapability] = useState('normal');
  const [permissions, setPermissions] = useState({
    product_view: false,
    product_add: false,
    product_update: false,
    product_delete: false,
    brand_view: false,
    brand_add: false,
    brand_update: false,
    brand_delete: false,
    location_view: false,
    location_add: false,
    location_update: false,
    location_delete: false,
    supplier_view: false,
    supplier_add: false,
    supplier_update: false,
    supplier_delete: false,
  });

  useEffect(() => {
    // Note: Need an API to list users, adding it now
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // For now, I'll assume there's a route /api/auth/users
    // I should add this to the backend
    try {
      const { data } = await axios.get('http://localhost:5000/api/auth/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', { username, password, capability, permissions });
      alert('User created successfully');
      setUsername('');
      setPassword('');
      setPermissions(Object.keys(permissions).reduce((acc, key) => ({ ...acc, [key]: false }), {}));
      fetchUsers();
    } catch (err) {
      alert('Error creating user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/api/auth/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting user');
      }
    }
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage system access and roles</p>
      </div>

      <div className="users-content">
        <div className="user-form-card">
          <h3>Create New User</h3>
          <form onSubmit={handleCreateUser}>
            <div className="form-group">
              <label>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={capability} onChange={(e) => setCapability(e.target.value)}>
                <option value="normal">Normal User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            {capability === 'normal' && (
              <div className="permissions-section">
                <label className="section-label">Permissions</label>
                <div className="permissions-grid">
                  {Object.keys(permissions).map(key => (
                    <label key={key} className="permission-toggle">
                      <input 
                        type="checkbox" 
                        checked={permissions[key]} 
                        onChange={(e) => setPermissions({...permissions, [key]: e.target.checked})} 
                      />
                      <span>{key.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary full-width">
              <UserPlus size={20} />
              <span>Create User</span>
            </button>
          </form>
        </div>

        <div className="users-list-card">
          <h3>Existing Users</h3>
          <div className="users-list">
            {users.map(u => (
              <div key={u._id} className="user-item">
                <div className="user-avatar">
                  {u.capability === 'admin' ? <Shield size={20} /> : <UserIcon size={20} />}
                </div>
                <div className="user-details">
                  <p className="u-name">{u.username}</p>
                  <p className="u-role">{u.capability}</p>
                </div>
                <div className="user-actions">
                  <button className="action-btn delete" onClick={() => handleDeleteUser(u._id)} title="Delete User">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
