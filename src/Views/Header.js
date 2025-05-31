// Header.js
import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <div className="header-container">
      <div className="header-card">
        <div className="header-graphic">
          {/* Example hex pattern or SVG overlay – replace or refine as needed */}
          <div className="hex-overlay">
            <div className="hex-row">
              <div className="hex"></div>
              <div className="hex"></div>
              <div className="hex"></div>
            </div>
            <div className="hex-row offset">
              <div className="hex"></div>
              <div className="hex"></div>
              <div className="hex"></div>
            </div>
          </div>
          <img className="header-logo" src="/logo512.png" alt="Sapisphere Logo" />
        </div>

        <div className="header-text">
          <h1 className="header-title">Sapisphere</h1>
          <p className="header-tagline">
            Building Tomorrow’s Collective Intelligence, Today.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Header;