import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import useAuthStore from '../store/authStore';
import './UserProfiles.css';

const UserProfiles = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Set up real-time listener for users collection
    const usersQuery = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(usersQuery, (querySnapshot) => {
      const usersData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(userData => userData.id !== user.uid); // Exclude current user

      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching users:', error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <div className="users-loading">Loading users...</div>;
  }

  if (users.length === 0) {
    return <div className="no-users">No other users found</div>;
  }

  return (
    <div className="users-container">
      <h2>Community Members</h2>
      <div className="users-grid">
        {users.map(userData => (
          <div key={userData.id} className="user-card">
            <div className="user-header">
              <h3>{userData.displayName}</h3>
            </div>
            <div className="user-content">
              <div className="user-field">
                <label>Member Since</label>
                <div className="field-value">
                  {new Date(userData.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="user-field">
                <label>Areas of Expertise</label>
                <div className="field-value expertise-list">
                  {userData.expertise && userData.expertise.length > 0 ? (
                    userData.expertise.map((skill, index) => (
                      <span key={index} className="expertise-tag">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="no-expertise">No expertise areas added yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProfiles; 