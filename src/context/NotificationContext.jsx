import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifCount, setNotifCount] = useState(0);
  const { user } = useAuth();

  const fetchNotifCount = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await axios.get('http://localhost:5000/api/products/notifications');
      setNotifCount(data.length);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifCount();
  }, [fetchNotifCount]);

  return (
    <NotificationContext.Provider value={{ notifCount, refreshNotifs: fetchNotifCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
