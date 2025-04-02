import React from "react";
import { FaInstagram, FaFacebook } from "react-icons/fa";

const Footer = () => {
  return (
      <footer
          id="app-footer"
          className="w-full bg-[rgb(42,42,42)] text-white py-4 px-8 relative"
      >
        {/* Container that aligns items horizontally in a single row */}
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          {/* Left side text */}
          <div className="text-sm">
            &copy; 2025 Pearl Path. All rights reserved.
          </div>

          {/* Right side links */}
          <div className="flex items-center gap-4 text-sm">
            <a
                href="https://www.instagram.com/yourpage"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:underline"
            >
              <FaInstagram /> Instagram
            </a>
            <a
                href="https://www.facebook.com/yourpage"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:underline"
            >
              <FaFacebook /> Facebook
            </a>
            <a href="/contact" className="hover:underline">
              Contact
            </a>
          </div>
        </div>
      </footer>
  );
};

export default Footer;
