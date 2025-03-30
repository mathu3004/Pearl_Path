// src/components/Navbar.jsx
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu((prev) => !prev);
  };

  return (
      <header className="fixed top-0 left-0 w-full h-[70px] bg-[rgba(39,47,45,0.7)] flex items-center justify-between px-8 shadow-md z-50">
        {/* Logo Section */}
        <div className="flex items-center h-full">
          <img
              src="/IconPearl.png"
              alt="Logo"
              className="h-auto max-h-[50px] object-contain mr-5"
          />
        </div>

        {/* Nav Links */}
        <ul className="hidden md:flex gap-8 items-center">
          {/* Public Links */}
          <li>
            <Link to="/home" className="text-white text-lg hover-link">
              Home
            </Link>
          </li>
          <li>
            <Link to="/itinerary" className="text-white text-lg hover-link">
              Itinerary
            </Link>
          </li>
          <li>
            <Link to="/chatbot" className="text-white text-lg hover-link">
              Help!
            </Link>
          </li>
          <li>
            <Link to="/about-us" className="text-white text-lg hover-link">
              About Us
            </Link>
          </li>
          <li>
            <Link to="/features" className="text-white text-lg hover-link">
              Features
            </Link>
          </li>

          {!auth.token ? (
              /* If NOT logged in */
              <>
                <li>
                  <Link to="/login" className="text-white text-lg hover-link">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-white text-lg hover-link">
                    Sign Up
                  </Link>
                </li>
              </>
          ) : (
              /* If logged in */
              <>
                {auth.user?.role === "vendor" ? (
                    <li>
                      <Link
                          to="/vendor-dashboard"
                          className="text-white text-lg hover-link"
                      >
                        Dashboard
                      </Link>
                    </li>
                ) : (
                    <li>
                      <Link
                          to="/user-dashboard"
                          className="text-white text-lg hover-link"
                      >
                        Dashboard
                      </Link>
                    </li>
                )}

                {/* Profile Icon + Dropdown */}
                <li className="relative">
                  <img
                      src="/profile-icon.png" /* Replace with your user icon path */
                      alt="Profile Icon"
                      className="h-8 w-8 rounded-full cursor-pointer"
                      onClick={toggleProfileMenu}
                  />
                  {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white text-black p-2 rounded shadow-md">
                        <p className="font-bold mb-2">
                          {auth.user?.username} ({auth.user?.role})
                        </p>
                        <Link
                            to="/profile"
                            className="block hover:bg-gray-100 p-1 rounded"
                        >
                          View Profile
                        </Link>
                        <hr className="my-2" />
                        <button
                            onClick={handleLogout}
                            className="w-full text-left hover:bg-gray-100 p-1 rounded"
                        >
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

export default Navbar;
