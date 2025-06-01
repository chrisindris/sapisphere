import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import useAuthStore from '../store/authStore';
import { generateLLMResponse } from '../utils/llmService';
import './ReplyForm.css';

const ReplyForm = ({ postId, parentReplyId = null }) => {
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      // Add user's reply
      await addDoc(collection(db, 'posts', postId, 'replies'), {
        text: replyText.trim(),
        authorId: user.uid,
        createdAt: serverTimestamp(),
        isLLMResponse: false,
        parentReplyId: parentReplyId
      });

      // Generate and add LLM response
      const llmResponse = await generateLLMResponse(replyText.trim());
      if (llmResponse) {
        await addDoc(collection(db, 'posts', postId, 'replies'), {
          text: llmResponse.text,
          authorId: 'llm',
          modelName: llmResponse.modelName,
          createdAt: serverTimestamp(),
          isLLMResponse: true,
          parentReplyId: parentReplyId,
          expertiseAnalysis: llmResponse.expertiseAnalysis // Store the expertise analysis
        });

        // If expertise was detected, update the user's profile
        if (llmResponse.detectedExpertise) {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            expertise: arrayUnion(llmResponse.detectedExpertise)
          });
        }
      }

      setReplyText(''); // Clear the input after successful reply
    } catch (error) {
      console.error('Error creating reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`reply-form-container ${parentReplyId ? 'nested-reply' : ''}`}>
      <form onSubmit={handleSubmit} className="reply-form">
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder={parentReplyId ? "Reply to this comment..." : "Write a reply..."}
          className="reply-input"
          disabled={isSubmitting}
        />
        <button 
          type="submit" 
          className="reply-button"
          disabled={isSubmitting || !replyText.trim()}
        >
          {isSubmitting ? 'Replying...' : 'Reply'}
        </button>
      </form>
    </div>
  );
};

export default ReplyForm; 