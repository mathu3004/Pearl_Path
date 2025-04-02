// src/ItinerarySelection.js
import React from 'react';
import { Link } from 'react-router-dom';
import './ItineararySelectionMode.css';
import Layout from './components/Layout';
import Header from './components/Header';
import Footer from './components/Footer';

const ChooseMode = () => {
  return (
    <div className='main'>
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
    </div>
  );
};

export default ChooseMode;