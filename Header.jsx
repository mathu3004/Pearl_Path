import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
      <header className="fixed top-0 left-0 w-full h-[70px] bg-[rgba(39,47,45,0.7)] flex items-center justify-between px-8 shadow-md z-50">
        <div className="flex items-center h-full">
          <img
              src="IconPearl.png"
              alt="Logo"
              className="h-full max-h-[70px] mr-5 object-contain"
          />
        </div>
        <ul className="hidden md:flex gap-8 mr-8">
          <li>
            <Link
                to="/home"
                className="text-white text-lg px-2 py-1 mt-5 mb-1 rounded transition duration-300 hover:bg-[rgba(255,255,255,0.2)] hover:-translate-y-1 hover:text-black"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
                to="/itinerary"
                className="text-white text-lg px-2 py-1 mt-5 mb-1 rounded transition duration-300 hover:bg-[rgba(255,255,255,0.2)] hover:-translate-y-1 hover:text-black"
            >
              Itinerary
            </Link>
          </li>
          <li>
            <Link
                to="/chatbot"
                className="text-white text-lg px-2 py-1 mt-5 mb-1 rounded transition duration-300 hover:bg-[rgba(255,255,255,0.2)] hover:-translate-y-1 hover:text-black"
            >
              Help!
            </Link>
          </li>
          <li>
            <Link
                to="/about-us"
                className="text-white text-lg px-2 py-1 mt-5 mb-1 rounded transition duration-300 hover:bg-[rgba(255,255,255,0.2)] hover:-translate-y-1 hover:text-black"
            >
              About Us
            </Link>
          </li>
          <li>
            <Link
                to="/features"
                className="text-white text-lg px-2 py-1 mt-5 mb-1 rounded transition duration-300 hover:bg-[rgba(255,255,255,0.2)] hover:-translate-y-1 hover:text-black"
            >
              Features
            </Link>
          </li>
        </ul>
      </header>
  );
};

export default Header;
