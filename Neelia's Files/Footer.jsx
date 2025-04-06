import React from "react";
import { FaInstagram, FaFacebook } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full bg-[rgb(42,42,42)] text-white text-center py-4 px-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto">
        <div className="text-sm ml-8">
          &copy; 2025 Pearl Path. All rights reserved.
        </div>
        <div className="flex flex-col md:flex-row items-center text-sm gap-4 mr-8">
          <div className="flex gap-4">
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
          </div>
          <a href="/contact" className="hover:underline">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
