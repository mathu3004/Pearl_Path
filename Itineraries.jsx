// src/pages/Itineraries.jsx
import React from "react";
import { Link } from "react-router-dom";

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
    return (
        <>
            {/* Inject fade-in keyframes */}
            <style>{fadeInKeyframes}</style>
            <div
                style={{
                    backgroundImage: 'url("/Caravan.jpg")',
                    backgroundSize: "cover",          // Ensures the background covers the screen
                    backgroundPosition: "center",     // Centers the image
                    backgroundRepeat: "no-repeat",
                    position: "relative",
                    width: "100%",
                    minHeight: "100vh",
                    backgroundColor: "#f0f0f0",
                    fontFamily: "'Poppins', sans-serif",
                    animation: "fadeIn 1s ease forwards",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "40px 20px",
                }}
            >
                <h1
                    style={{
                        fontSize: "3rem",
                        fontWeight: "bold",
                        color: "#333",
                        marginBottom: "20px",
                    }}
                >
                    Itineraries
                </h1>
                <p
                    style={{
                        fontSize: "1.2rem",
                        color: "#555",
                        marginBottom: "40px",
                        maxWidth: "800px",
                        textAlign: "center",
                    }}
                >
                    Choose your itinerary option and let Pearl Path guide your journey.
                </p>
                <div style={{ display: "flex", gap: "30px" }}>
                    <Link
                        to="/OnlyItinerary"
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
                        Itinerary
                    </Link>
                    <Link
                        to="/RadiusItinerary"
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
                        Itinerary Based Radius
                    </Link>
                </div>
            </div>
        </>
    );
};

export default Itineraries;
