import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import './PostFeed.css';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create a query to get posts ordered by creation time
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching posts:', error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return <div className="post-feed-loading">Loading posts...</div>;
  }

  return (
    <div className="post-feed-container">
      {posts.length === 0 ? (
        <div className="no-posts">No posts yet. Be the first to post!</div>
      ) : (
        posts.map(post => (
          <div 
            key={post.id} 
            className={`post-card ${post.isLLMResponse ? 'llm-response' : ''}`}
          >
            <div className="post-content">{post.text}</div>
            <div className="post-meta">
              <span className="post-author">
                {post.isLLMResponse 
                  ? `${post.modelName || 'AI Assistant'}`
                  : `Posted by: ${post.authorId}`
                }
              </span>
              <span className="post-time">{formatDate(post.createdAt)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PostFeed; 