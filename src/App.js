// src/App.js
import React, { useEffect } from 'react';
import './App.css';
import Header from './Views/Header';
import Menu from './Views/Menu';
import Login from './components/Login';
import CreatePost from './components/CreatePost';
import PostFeed from './components/PostFeed';
import Profile from './components/Profile';
import useAuthStore from './store/authStore';

function App() {
  const { user, init } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="App">
      <Header />
      {!user ? (
        <Login />
      ) : (
        <>
          <Menu />
          <div className="main-content">
            <div className="content-left">
              <CreatePost />
              <PostFeed />
            </div>
            <div className="content-right">
              <Profile />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
