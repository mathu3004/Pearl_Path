// src/pages/LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";

// We define our keyframes as a string so we can inject them via a <style> tag.
const fadeInKeyframes = `
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

const LandingPage = () => {
  return (
      <>
        {/* Inject keyframes for fade-in animation */}
        <style>{fadeInKeyframes}</style>

        <div
            style={{
              width: "100%",
              minHeight: "100vh",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Poppins', sans-serif", // Modern font
              backgroundColor: "#f0f0f0",
              animation: "fadeIn 1s ease forwards",
            }}
        >
          {/* Left Section: Headline & CTAs */}
          <div
              style={{
                flex: 1,
                padding: "60px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
          >
            <h1
                style={{
                  fontSize: "3rem",
                  fontWeight: "bold",
                  marginBottom: "20px",
                  color: "#333",
                }}
            >
              Welcome to Pearl Path
            </h1>
            <p
                style={{
                  fontSize: "1.2rem",
                  marginBottom: "30px",
                  color: "#555",
                  lineHeight: "1.5",
                  maxWidth: "600px",
                }}
            >
              Discover, create, and share itineraries with ease.
              Embark on your next adventure with Pearl Path!
            </p>
            <div style={{ display: "flex", gap: "15px" }}>
              <Link
                  to="/register"
                  style={{
                    padding: "14px 28px",
                    backgroundColor: "#128C7E", // Dark WhatsApp green
                    color: "#fff",
                    borderRadius: "5px",
                    textDecoration: "none",
                    fontWeight: "bold",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#25D366")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#128C7E")}
              >
                Sign Up
              </Link>
              <Link
                  to="/login"
                  style={{
                    padding: "14px 28px",
                    backgroundColor: "#128C7E",
                    color: "#fff",
                    borderRadius: "5px",
                    textDecoration: "none",
                    fontWeight: "bold",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#25D366")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#128C7E")}
              >
                Login
              </Link>
            </div>
          </div>

          {/* Right Section: Hero Image */}
          <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px",
              }}
          >
            <img
                src="/LandingPage1.jpg" // Replace with your actual image path
                alt="Pearl Path Hero"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: "10px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "transform 0.3s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </div>
        </div>
      </>
  );
};

export default LandingPage;
