import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './Menu.css';

const Menu = () => {
  const { user, logout } = useAuthStore();
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setDisplayName(userDoc.data().displayName);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="menu-container">
      <div className="menu-content">
        <div className="user-info">
          <span className="user-name">{displayName || user?.email}</span>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Menu; 