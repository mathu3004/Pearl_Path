// src/ItinerarySelection.js
import React from 'react';
import { Link } from 'react-router-dom';
import './ItineararySelectionMode.css';
import Layout from './components/Layout';

const Header = () => (
  <header className="header">
    <img src="/assests/IconPearl.png" alt="Logo" />
    <ul className="nav-links">
      <Link to="/home">Home</Link>
      <Link to="/visual/testuser/sample-itinerary">Itinerary</Link>
      <Link to="/about-us">AboutUs</Link>
      <Link to="/features">Features</Link>
      <Link to="/signin">Logout</Link>
    </ul>
  </header>
);

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      <div className="footer-left">&copy; 2025 Pearl Path. All rights reserved.</div>
      <div className="footer-right">
        <div className="social-links">
          <a href="https://www.instagram.com/yourpage" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.facebook.com/yourpage" target="_blank" rel="noopener noreferrer">Facebook</a>
        </div>
        <a href="/contact">Contact</a>
      </div>
    </div>
  </footer>
);

const ChooseMode = () => {
  return (
    <div className="choose-container">
      <Header />
      <div className="choose-content glass-effect">
        <h2 className="choose-title">Select Your Itinerary Generation Mode</h2>
        <div className="choose-buttons">
          <Link to="/radius-mode" className="choose-button-link">
            <button className="choose-button">Generate with Radius</button>
            <p className="choose-description">Specify a maximum distance between destinations for proximity-based planning.</p>
          </Link>
          <Link to="/no-radius-mode" className="choose-button-link">
            <button className="choose-button">Generate without Radius</button>
            <p className="choose-description">Allow generation with no restriction on distance between locations.</p>
          </Link>
        </div>
      </div>
      <Layout>
      </Layout>
      <Footer />
    </div>
  );
};

export default ChooseMode;