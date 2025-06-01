import React, { useState } from 'react';
import useAuthStore from '../store/authStore';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, register, error, loading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegistering) {
      await register(email, password, displayName);
    } else {
      await login(email, password);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isRegistering ? 'Create Account' : 'Welcome to Sapisphere'}</h2>
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Sign In')}
          </button>
        </form>
        <div className="toggle-mode">
          <button type="button" className="toggle-button" onClick={toggleMode}>
            {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login; 