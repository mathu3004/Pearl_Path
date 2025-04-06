import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gray-800 bg-opacity-80 text-white px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link to="/">Pearl Path</Link>
      </div>
      <div className="hidden md:flex space-x-6">
        <Link to="/" className="hover:text-gray-300">
          Home
        </Link>
        <Link to="/chatbot" className="hover:text-gray-300">
          Help!
        </Link>
        <Link to="/about-us" className="hover:text-gray-300">
          About Us
        </Link>
        <Link to="/features" className="hover:text-gray-300">
          Features
        </Link>
      </div>
      <div className="space-x-4">
        {!auth.token ? (
          <>
            <Link to="/login" className="hover:text-gray-300">
              Login
            </Link>
            <Link to="/register" className="hover:text-gray-300">
              Sign Up
            </Link>
          </>
        ) : (
          <>
            {auth.user?.role === "vendor" ? (
              <Link to="/vendor-dashboard" className="hover:text-gray-300">
                Dashboard
              </Link>
            ) : (
              <Link to="/user-dashboard" className="hover:text-gray-300">
                Dashboard
              </Link>
            )}
            <button onClick={handleLogout} className="hover:text-gray-300">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
