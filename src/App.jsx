import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Products from './pages/Products';
import Management from './pages/Management';

import Settings from './pages/Settings';
import Users from './pages/Users';
import LowStock from './pages/LowStock';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.capability !== 'admin') return <Navigate to="/" />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          } />
          
          <Route path="/low-stock" element={
            <ProtectedRoute>
              <LowStock />
            </ProtectedRoute>
          } />
          
          <Route path="/locations" element={
            <ProtectedRoute>
              <Management 
                type="Location" 
                title="Locations" 
                endpoint="locations"
                columns={[
                  { key: 'name', label: 'Location Name' },
                  { key: 'address', label: 'Address' }
                ]}
              />
            </ProtectedRoute>
          } />
          
          <Route path="/suppliers" element={
            <ProtectedRoute>
              <Management 
                type="Supplier" 
                title="Suppliers" 
                endpoint="suppliers"
                columns={[
                  { key: 'name', label: 'Supplier Name' },
                  { key: 'contactNo', label: 'Contact No' }
                ]}
              />
            </ProtectedRoute>
          } />
          
          <Route path="/brands" element={
            <ProtectedRoute>
              <Management 
                type="Brand" 
                title="Brands" 
                endpoint="brands"
                columns={[
                  { key: 'name', label: 'Brand Name' },
                  { key: 'description', label: 'Description' }
                ]}
              />
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          } />

          <Route path="/settings" element={
            <AdminRoute>
              <Settings />
            </AdminRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
