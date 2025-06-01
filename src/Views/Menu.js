import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import './Menu.css';

const Menu = () => {
  const { user, logout } = useAuthStore();
  const [displayName, setDisplayName] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (!user) return;

    // Set up real-time listener for user profile
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setDisplayName(doc.data().displayName);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="menu-container">
      <div className="menu-content">
        <div className="menu-left">
          <div className="user-info">
            <span className="user-name">{displayName || user?.email}</span>
          </div>
          <nav className="menu-nav">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/users" 
              className={`nav-link ${location.pathname === '/users' ? 'active' : ''}`}
            >
              Community
            </Link>
          </nav>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Menu; 