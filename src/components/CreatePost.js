import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import useAuthStore from '../store/authStore';
import { generateLLMResponse } from '../utils/llmService';
import './CreatePost.css';

const CreatePost = () => {
  const [postText, setPostText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postText.trim()) return;

    setIsSubmitting(true);
    try {
      // Add user's post
      const userPostRef = await addDoc(collection(db, 'posts'), {
        text: postText.trim(),
        authorId: user.uid,
        createdAt: serverTimestamp(),
        isLLMResponse: false
      });

      // Generate and add LLM response
      const llmResponse = await generateLLMResponse(postText.trim());
      if (llmResponse) {
        await addDoc(collection(db, 'posts'), {
          text: llmResponse.text,
          authorId: 'llm',
          modelName: llmResponse.modelName,
          createdAt: serverTimestamp(),
          isLLMResponse: true,
          parentPostId: userPostRef.id
        });
      }

      setPostText(''); // Clear the input after successful post
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-post-container">
      <form onSubmit={handleSubmit} className="create-post-form">
        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="What's on your mind?"
          className="post-input"
          disabled={isSubmitting}
        />
        <button 
          type="submit" 
          className="post-button"
          disabled={isSubmitting || !postText.trim()}
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost; 