import { create } from 'zustand';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  // Initialize auth state listener
  init: () => {
    onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
    });
  },

  // Login function
  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      set({ user: userCredential.user, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Logout function
  logout: async () => {
    try {
      set({ loading: true, error: null });
      await signOut(auth);
      set({ user: null, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  }
}));

export default useAuthStore; 