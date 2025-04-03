import React from 'react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import '../ItineraryApp.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      <div className="footer-left">&copy; 2025 Pearl Path. All rights reserved.</div>
      <div className="footer-right">
        <div className="social-links">
          <a href="https://www.instagram.com/tripadvisor" target="_blank" rel="noopener noreferrer">
            <FaInstagram size={20} style={{ marginRight: '8px' }} /> Instagram
          </a>
          <a href="https://web.facebook.com/Tripadvisor" target="_blank" rel="noopener noreferrer">
            <FaFacebook size={20} style={{ marginRight: '8px' }} /> Facebook
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
