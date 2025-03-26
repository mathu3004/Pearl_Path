import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";

const Header = () => {
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
        <div className="flex items-center h-full">
          <img
              src="IconPearl.png"
              alt="Logo"
              className="h-auto max-h-[50px] object-contain mr-5"
          />
        </div>
        <ul className="hidden md:flex gap-8 items-center">
          <li>
            <Link
                to="/home"
                className="text-white text-lg px-2 py-1 rounded transition duration-300 hover:bg-[rgba(255,255,255,0.2)] hover:-translate-y-1 hover:text-black"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
                to="/itineraries"
                className="text-white text-lg px-2 py-1 rounded transition duration-300 hover:bg-[rgba(255,255,255,0.2)] hover:-translate-y-1 hover:text-black"
            >
              Itineraries
            </Link>
          </li>
          <li>
            <Link
                to="/about-us"
                className="text-white text-lg px-2 py-1 rounded transition duration-300 hover:bg-[rgba(255,255,255,0.2)] hover:-translate-y-1 hover:text-black"
            >
              About Us
            </Link>
          </li>
          {!auth.token ? (
              <>
                <li>
                  <Link
                      to="/login"
                      className="text-white text-lg px-2 py-1 rounded transition duration-300 hover:bg-[rgba(255,255,255,0.2)] hover:-translate-y-1 hover:text-black"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                      to="/register"
                      className="text-white text-lg px-2 py-1 rounded transition duration-300 hover:bg-[rgba(255,255,255,0.2)] hover:-translate-y-1 hover:text-black"
                  >
                    Sign Up
                  </Link>
                </li>
              </>
          ) : (
              <>
                {auth.user?.role === "vendor" ? (
                    <li>
                      <Link
                          to="/vendor-dashboard"
                          className="text-white text-lg px-2 py-1 rounded transition duration-300 hover:bg-[rgba(255,255,255,0.2)] hover:-translate-y-1 hover:text-black"
                      >
                        Dashboard
                      </Link>
                    </li>
                ) : (
                    <li>
                      <Link
                          to="/user-dashboard"
                          className="text-white text-lg px-2 py-1 rounded transition duration-300 hover:bg-[rgba(255,255,255,0.2)] hover:-translate-y-1 hover:text-black"
                      >
                        Dashboard
                      </Link>
                    </li>
                )}
                <li className="relative">
                  <img
                      src="/profile-icon.jpg"
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

export default Header;
