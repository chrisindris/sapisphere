import React from 'react';
import useAuthStore from '../store/authStore';
import './Menu.css';

const Menu = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="menu-container">
      <div className="menu-content">
        <div className="user-info">
          <span className="user-email">{user?.email}</span>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Menu; 