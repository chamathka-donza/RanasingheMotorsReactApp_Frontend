import React, { useState } from 'react';
import axios from 'axios';
import { Save, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    if (password && password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      const payload = { username };
      if (password) payload.password = password;

      const { data } = await axios.put('http://localhost:5000/api/auth/profile', payload);
      updateUser(data);
      setMsg('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    }
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Update your personal account settings</p>
      </div>

      <div className="profile-card">
        <div className="profile-icon">
          <UserCircle size={64} />
          <p className="role-badge">{user?.capability}</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {msg && <div className="success-banner">{msg}</div>}
          {error && <div className="error-banner">{error}</div>}
          
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>New Password (Optional)</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
            />
          </div>

          <button type="submit" className="btn btn-primary full-width">
            <Save size={20} />
            <span>Save Profile</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
