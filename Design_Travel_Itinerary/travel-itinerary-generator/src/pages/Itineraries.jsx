import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import Header from "../components/Header";
import Layout from '../components/Layout';
import Footer from "../components/Footer";

const fadeInKeyframes = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

const Itineraries = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!auth?.token) {
      navigate("/login");
    }
  }, [auth, navigate]);

  return (
    <>
      <Header />
      {/* Inject fade-in keyframes */}
      <style>{fadeInKeyframes}</style>
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
          fontFamily: "'Poppins', sans-serif",
          animation: "fadeIn 1s ease forwards",
          overflow: "hidden",
        }}
      >
        {/* Background Image */}
        <div
          style={{
            backgroundImage: 'url("/Caravan.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
          }}
        />
        {/* Lighter Dark Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            zIndex: 2,
          }}
        />
        {/* Main Content */}
        <div
          style={{
            position: "relative",
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "190px 20px",
            minHeight: "100vh",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              color: "#fff",
              marginBottom: "20px",
            }}
          >
            Itineraries
          </h1>
          <p
            style={{
              fontWeight: "bold",
              fontSize: "1.2rem",
              color: "#eee",
              marginBottom: "40px",
              maxWidth: "800px",
              padding: "20px",
            }}
          >
            Choose your itinerary option and let Pearl Path guide your journey!
          </p>
          <div style={{ display: "flex", gap: "30px" }}>
            <Link
              to="/itinerary-generator"
              style={{
                padding: "15px 30px",
                backgroundColor: "#128C7E",
                color: "#fff",
                borderRadius: "5px",
                textDecoration: "none",
                fontWeight: "bold",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#25D366")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#128C7E")
              }
            >
              Itinerary Generator
            </Link>
            <Link
              to="/radius-itinerary-generator"
              style={{
                padding: "15px 30px",
                backgroundColor: "#333",
                color: "#fff",
                borderRadius: "5px",
                textDecoration: "none",
                fontWeight: "bold",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#555")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#333")
              }
            >
              Itinerary Generator Based on Radius
            </Link>
          </div>
        </div>
      </div>
      <Layout />
      <Footer />
    </>
  );
};

export default Itineraries;
