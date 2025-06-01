import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import ReplyForm from './ReplyForm';
import './RepliesList.css';

const ReplyCard = ({ reply, postId, onReply }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);

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

  return (
    <div className={`reply-card ${reply.isLLMResponse ? 'llm-response' : ''}`}>
      <div className="reply-content">{reply.text}</div>
      <div className="reply-meta">
        <span className="reply-author">
          {reply.isLLMResponse 
            ? `${reply.modelName || 'AI Assistant'}`
            : `Replied by: ${reply.authorId}`
          }
        </span>
        <span className="reply-time">{formatDate(reply.createdAt)}</span>
        <button 
          className="reply-to-reply-button"
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          {showReplyForm ? 'Cancel' : 'Reply'}
        </button>
      </div>
      {showReplyForm && (
        <ReplyForm postId={postId} parentReplyId={reply.id} />
      )}
    </div>
  );
};

const RepliesList = ({ postId }) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!postId) {
      console.log('No postId provided to RepliesList');
      setLoading(false);
      return;
    }

    console.log('Setting up replies listener for post:', postId);

    try {
      // Create a query to get replies ordered by creation time
      const repliesRef = collection(db, 'posts', postId, 'replies');
      const q = query(repliesRef, orderBy('createdAt', 'asc'));

      // Set up real-time listener
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          console.log('Received replies snapshot:', querySnapshot.size, 'replies');
          const repliesData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setReplies(repliesData);
          setLoading(false);
          setError(null);
        }, 
        (error) => {
          console.error('Error in replies listener:', {
            code: error.code,
            message: error.message,
            stack: error.stack
          });
          setError('Failed to load replies. Please try again later.');
          setLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => {
        console.log('Cleaning up replies listener for post:', postId);
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up replies listener:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      setError('Failed to load replies. Please try again later.');
      setLoading(false);
    }
  }, [postId]);

  // Organize replies into a tree structure
  const organizeReplies = (replies) => {
    const replyMap = new Map();
    const rootReplies = [];

    // First pass: create a map of all replies
    replies.forEach(reply => {
      replyMap.set(reply.id, { ...reply, children: [] });
    });

    // Second pass: organize into tree structure
    replies.forEach(reply => {
      const replyWithChildren = replyMap.get(reply.id);
      if (reply.parentReplyId) {
        const parent = replyMap.get(reply.parentReplyId);
        if (parent) {
          parent.children.push(replyWithChildren);
        }
      } else {
        rootReplies.push(replyWithChildren);
      }
    });

    return rootReplies;
  };

  const renderReplyTree = (reply) => (
    <div key={reply.id} className="reply-tree">
      <ReplyCard reply={reply} postId={postId} />
      {reply.children.length > 0 && (
        <div className="nested-replies">
          {reply.children.map(child => renderReplyTree(child))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return <div className="replies-loading">Loading replies...</div>;
  }

  if (error) {
    return <div className="replies-error">{error}</div>;
  }

  if (replies.length === 0) {
    return null;
  }

  const organizedReplies = organizeReplies(replies);

  return (
    <div className="replies-section">
      {organizedReplies.map(reply => renderReplyTree(reply))}
    </div>
  );
};

export default RepliesList; 