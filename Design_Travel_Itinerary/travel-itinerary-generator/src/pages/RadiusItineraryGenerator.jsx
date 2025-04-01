import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
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

const RadiusItineraryGenerator = () => {
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
                    backgroundImage: 'url("/Mirissa.jpg")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundColor: "#f0f0f0",
                    overflow: "hidden",
                    padding: "270px 20px",
                }}
            >
                {/* Dark Overlay */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                        zIndex: 1,
                    }}
                />
                {/* Main Content */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 2,
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
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
                        Itinerary Generator Based on Radius
                    </h1>
                    <p
                        style={{
                            fontSize: "1.2rem",
                            color: "#eee",
                            marginBottom: "40px",
                            maxWidth: "800px",
                            textAlign: "center",
                            fontWeight: "bold",
                        }}
                    >
                        Select an option below to either create a new itinerary or modify an existing one.
                    </p>
                    <div style={{ display: "flex", gap: "30px", justifyContent: "center" }}>
                        <Link
                            to="/RadiusTravelItineraryGenerator"
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
                            Create New Itinerary
                        </Link>
                        <Link
                            to="/modify-itinerary"
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
                            Modify Itinerary
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default RadiusItineraryGenerator;