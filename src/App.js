// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Header from './Views/Header';
import Menu from './Views/Menu';
import Login from './components/Login';
import CreatePost from './components/CreatePost';
import PostFeed from './components/PostFeed';
import Profile from './components/Profile';
import UserProfiles from './components/UserProfiles';
import useAuthStore from './store/authStore';

function App() {
  const { user, init } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <Router>
      <div className="App">
        <Header />
        {!user ? (
          <Login />
        ) : (
          <>
            <Menu />
            <div className="main-content">
              <div className="content-left">
                <Routes>
                  <Route path="/" element={
                    <>
                      <CreatePost />
                      <PostFeed />
                    </>
                  } />
                  <Route path="/users" element={<UserProfiles />} />
                </Routes>
              </div>
              <div className="content-right">
                <Profile />
              </div>
            </div>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
