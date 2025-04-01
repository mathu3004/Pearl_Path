// src/pages/OnlyItinerary.jsx
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

const OnlyItinerary = () => {
    return (
        <>
            {/* Inject fade-in keyframes */}
            <style>{fadeInKeyframes}</style>
            <div
                style={{
                    backgroundImage: 'url("/Beach.jpg")',
                    backgroundSize: "cover",          // Ensures the background covers the screen
                    backgroundPosition: "center",     // Centers the image
                    backgroundRepeat: "no-repeat",
                    width: "100%",
                    minHeight: "100vh",
                    backgroundColor: "#f0f0f0",
                    fontFamily: "'Poppins', sans-serif",
                    animation: "fadeIn 1s ease forwards",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
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
                    Itinerary Options
                </h1>
                <p
                    style={{
                        fontSize: "1.2rem",
                        color: "#555",
                        marginBottom: "40px",
                        textAlign: "center",
                        maxWidth: "800px",
                    }}
                >
                    Choose an option below to either create a new travel plan or modify an existing one.
                </p>
                <div style={{ display: "flex", gap: "30px" }}>
                    <Link
                        to="/travelitinerarygenerator"
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
                        Create New Plan
                    </Link>
                    <Link
                        to="/modifyrequest"
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
                        Modify an Existing Plan
                    </Link>
                </div>
            </div>
        </>
    );
};

export default OnlyItinerary;