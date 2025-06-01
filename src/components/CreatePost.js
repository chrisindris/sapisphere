import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';
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

      console.log('Created user post:', userPostRef.id);

      // Generate and add LLM response as a reply
      const llmResponse = await generateLLMResponse(postText.trim());
      console.log('LLM Response:', llmResponse);

      if (llmResponse) {
        await addDoc(collection(db, 'posts', userPostRef.id, 'replies'), {
          text: llmResponse.text,
          authorId: 'llm',
          modelName: llmResponse.modelName,
          createdAt: serverTimestamp(),
          isLLMResponse: true,
          expertiseAnalysis: llmResponse.expertiseAnalysis
        });

        console.log('Added LLM reply with expertise analysis:', llmResponse.expertiseAnalysis);

        // If expertise was detected, update the user's profile
        if (llmResponse.detectedExpertise) {
          console.log('Detected expertise:', llmResponse.detectedExpertise);
          const userRef = doc(db, 'users', user.uid);
          try {
            await updateDoc(userRef, {
              expertise: arrayUnion(llmResponse.detectedExpertise)
            });
            console.log('Updated user profile with expertise');
          } catch (error) {
            console.error('Error updating user profile:', error);
          }
        } else {
          console.log('No expertise detected in response');
        }
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