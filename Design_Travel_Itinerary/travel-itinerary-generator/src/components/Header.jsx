import React from 'react';
import { Link } from 'react-router-dom';
import '../ItineraryApp.css';

const Header = () => {
  const username = JSON.parse(localStorage.getItem("user"))?.username || 'User';

  return (
    <header className="header">
      <div className="header-left">
        <img src="/assests/IconPearl.png" alt="Logo" />
        <span className="greeting">Welcome to Pearl Path, {username}</span>
      </div>
      <ul className="nav-links">
        <Link to="/home">Home</Link>
        <Link to="/itinerarySelection">Itinerary</Link>
        <Link to="/about-us">AboutUs</Link>
        <Link to="/features">Features</Link>
        <Link to="/signin">Logout</Link>
      </ul>
    </header>
  );
};

export default Header;