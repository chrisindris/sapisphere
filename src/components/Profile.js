import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import useAuthStore from '../store/authStore';
import './Profile.css';

const Profile = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Set up real-time listener for user profile
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setProfile(doc.data());
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching profile:', error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="profile-error">Profile not found</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Profile</h2>
        <div className="profile-content">
          <div className="profile-field">
            <label>Display Name</label>
            <div className="field-value">{profile.displayName}</div>
          </div>
          <div className="profile-field">
            <label>Email</label>
            <div className="field-value">{profile.email}</div>
          </div>
          <div className="profile-field">
            <label>Member Since</label>
            <div className="field-value">
              {new Date(profile.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className="profile-field">
            <label>Areas of Expertise</label>
            <div className="field-value expertise-list">
              {profile.expertise && profile.expertise.length > 0 ? (
                profile.expertise.map((skill, index) => (
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
    </div>
  );
};

export default Profile; 