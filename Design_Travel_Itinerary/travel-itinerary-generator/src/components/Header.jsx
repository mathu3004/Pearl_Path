import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';
import '../ItineraryApp.css';

const Header = () => {
  const { auth, fetchProfile, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userName, setUserName] = useState(auth?.user?.username || "User");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const role = auth?.user?.role;

  const toggleProfileMenu = () => {
    setShowProfileMenu((prev) => !prev);
  };

  // Logout handler: call logout and then redirect to login page
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Retrieve current user's profile to extract the username
  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await fetchProfile();
        if (profile && profile.user) {
          setUserName(profile.user.username);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    }
    loadProfile();
  }, [fetchProfile]);

  return (
    <header className="header">
      {/* Left side */}
      <div className="header-left">
        <img src="/assests/IconPearl.png" alt="Logo" id="logo" />
        <span className="greeting">Welcome to Pearl Path, {userName}</span>
      </div>

      {/* Navigation Links */}
      <ul className="nav-links">
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/itineraries">Itinerary</Link></li>
        <li><Link to="/about-us">AboutUs</Link></li>

        {!auth.token ? (
          <>
            <li><Link to="/">Login</Link></li>
            <li><Link to="/register">Sign Up</Link></li>
          </>
        ) : (
          <>
            <li>
              <Link to={role === 'vendor' ? '/vendor-dashboard' : '/user-dashboard'}>
                Dashboard
              </Link>
            </li>

            {/* Profile Dropdown */}
            <li className="relative">
              <img
                src="/profile-icon.jpg"
                alt="Profile Icon"
                className="profile-icon"
                onClick={toggleProfileMenu}
              />
              {showProfileMenu && (
                <div className="profile-container">
                  <p>{userName} ({role})</p>
                  <Link to="/profile">View Profile</Link>
                  <hr />
                  <button className="logout" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </li>
          </>
        )}
      </ul>
    </header>
  );
};

export default Header;