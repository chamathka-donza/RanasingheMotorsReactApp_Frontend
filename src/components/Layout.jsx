import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Package, 
  MapPin, 
  Truck, 
  Tag, 
  Users, 
  Settings, 
  LogOut,
  LayoutDashboard,
  Bell,
  AlertTriangle,
  UserCircle,
  Menu,
  X,
  Ship
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notifCount } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [];
  const isAdmin = user?.capability === 'admin';

  if (isAdmin || user?.permissions?.product_view) {
    navItems.push({ name: 'Products', path: '/', icon: Package });
  }
  if (isAdmin || user?.permissions?.location_view) {
    navItems.push({ name: 'Locations', path: '/locations', icon: MapPin });
  }
  if (isAdmin || user?.permissions?.supplier_view) {
    navItems.push({ name: 'Suppliers', path: '/suppliers', icon: Truck });
  }
  if (isAdmin || user?.permissions?.brand_view) {
    navItems.push({ name: 'Brands', path: '/brands', icon: Tag });
  }
  if (isAdmin || user?.permissions?.import_view) {
    navItems.push({ name: 'Imports', path: '/imports', icon: Ship });
  }

  navItems.push({ name: 'My Profile', path: '/profile', icon: UserCircle });

  if (isAdmin) {
    navItems.push(
      { name: 'Users', path: '/users', icon: Users },
      { name: 'Settings', path: '/settings', icon: Settings }
    );
  }

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-active' : ''}`}>
      {/* Backdrop overlay for mobile screen when sidebar is active */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
      
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-container">
            <div>
              <h1>Ranasinghe</h1>
              <span>Motors</span>
            </div>
            <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.name} 
              to={item.path} 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              onClick={() => setSidebarOpen(false)} // Close sidebar on nav item click on mobile
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <p className="username">{user?.username}</p>
            <p className="role">{user?.capability}</p>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="top-header">
          <div className="header-left">
            <button className="menu-toggle-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="search-bar">
              {/* Search logic here if needed */}
            </div>
          </div>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => navigate('/low-stock')}>
              <Bell size={20} />
              {notifCount > 0 && <span className="badge">{notifCount}</span>}
            </button>
          </div>
        </header>
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
