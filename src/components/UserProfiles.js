import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, getDoc } from 'firebase/firestore';
import useAuthStore from '../store/authStore';
import './UserProfiles.css';

const UserProfiles = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserExpertise, setCurrentUserExpertise] = useState([]);
  const [expertiseSimilarities, setExpertiseSimilarities] = useState({});

  useEffect(() => {
    if (!user) return;

    // Fetch current user's expertise
    const fetchCurrentUserExpertise = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setCurrentUserExpertise(userDoc.data().expertise || []);
        }
      } catch (error) {
        console.error('Error fetching current user expertise:', error);
      }
    };

    fetchCurrentUserExpertise();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Set up real-time listener for users collection
    const usersQuery = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(usersQuery, async (querySnapshot) => {
      const usersData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(userData => userData.id !== user.uid); // Exclude current user

      // Fetch similarity scores for each expertise
      const similarities = {};
      for (const userData of usersData) {
        if (userData.expertise) {
          for (const expertise of userData.expertise) {
            if (!similarities[expertise]) {
              try {
                const expertiseDoc = await getDoc(doc(db, 'expertises', expertise));
                if (expertiseDoc.exists()) {
                  similarities[expertise] = expertiseDoc.data().similarity || {};
                }
              } catch (error) {
                console.error(`Error fetching similarities for ${expertise}:`, error);
              }
            }
          }
        }
      }
      setExpertiseSimilarities(similarities);
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching users:', error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  // Calculate average similarity score for an expertise
  const calculateAverageSimilarity = (expertise) => {
    if (!currentUserExpertise.length || !expertiseSimilarities[expertise]) return null;

    const similarities = expertiseSimilarities[expertise];
    const relevantScores = currentUserExpertise
      .map(userExpertise => similarities[userExpertise])
      .filter(score => score !== undefined);

    if (relevantScores.length === 0) return null;

    const average = relevantScores.reduce((sum, score) => sum + score, 0) / relevantScores.length;
    return Math.round(average);
  };

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
                    userData.expertise.map((skill, index) => {
                      const similarityScore = calculateAverageSimilarity(skill);
                      return (
                        <span key={index} className="expertise-tag">
                          {skill}
                          {similarityScore !== null && (
                            <span className="similarity-score">
                              ({similarityScore}% match)
                            </span>
                          )}
                        </span>
                      );
                    })
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