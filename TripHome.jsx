// src/pages/TripHome.jsx
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const slides = [
    {
        title: "Handpicked Destinations",
        content:
            "Discover the true beauty of Sri Lanka. We focus on four breathtaking cities — Kandy, Ella, Nuwara Eliya, and Colombo — each offering unique experiences that capture local charm. Enjoy handpicked adventures, from misty hills to vibrant cityscapes, designed just for you.",
        image: "/Beach.jpg",
    },
    {
        title: "Fully Personalized Travel Plans",
        content:
            "No more generic tours. We craft travel itineraries that match your interests, budget, and schedule, ensuring every journey is uniquely yours. Just share your preferences, and we'll design a trip that feels tailor-made to inspire and delight.",
        image: "/Mirissa.jpg",
    },
    {
        title: "Seamless Journey Optimization",
        content:
            "Travel smarter, not farther. Our system clusters attractions, dining, and accommodations in close proximity so you spend less time commuting and more time exploring. Enjoy every moment of your journey with an itinerary that brings your favorite experiences just around the corner.",
        image: "/Caravan.jpg",
    },
    {
        title: "Travel Made Simple & Connected",
        content:
            "Plan, ask, and connect with ease. Our intuitive chat assistant offers instant answers and direct connections with hotels, restaurants, and local guides, ensuring a seamless travel experience. All your travel needs are met in one convenient, stress-free platform.",
        image: "/CreateAccount1.jpg",
    },
];

const fadeInKeyframes = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

const TripHome = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!auth?.token) {
            navigate("/login");
        }
    }, [auth, navigate]);

    // Auto-slide every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                minHeight: "100vh",
                fontFamily: "'Poppins', sans-serif",
                overflow: "hidden",
                backgroundColor: "#000", // Base background for contrast
            }}
        >
            {/* Main Content */}
            <div
                style={{
                    position: "relative",
                    zIndex: 3,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "center",
                    minHeight: "100vh",
                    padding: "50px 20px",
                    textAlign: "center",
                    color: "#fff",
                }}
            >
                {/* Header Section */}
                <header style={{ marginTop: "60px" }}>
                    <h1
                        style={{
                            fontSize: "3rem",
                            fontWeight: "bold",
                            margin: 0,
                            letterSpacing: "2px",
                        }}
                    >
                        PEARL PATH
                    </h1>
                    <p style={{ marginTop: "10px", fontSize: "1.2rem", opacity: 0.9 }}>
                        Your Next Adventure Awaits
                    </p>
                </header>

                {/* Slideshow Container */}
                <div
                    style={{
                        width: "80%",
                        maxWidth: "1000px",
                        height: "400px",
                        margin: "40px 0",
                        position: "relative",
                        borderRadius: "10px",
                        overflow: "hidden",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                    }}
                >
                    {/* Slide Background */}
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            backgroundImage: `url("${slides[currentSlide].image}")`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            transition: "background-image 1s ease-in-out",
                        }}
                    />
                    {/* Slide Overlay with Text */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: "20px",
                            left: "20px",
                            right: "20px",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            padding: "20px",
                            borderRadius: "5px",
                        }}
                    >
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", margin: 0 }}>
                            {slides[currentSlide].title}
                        </h2>
                        <p style={{ fontSize: "1rem", marginTop: "10px" }}>
                            {slides[currentSlide].content}
                        </p>
                    </div>
                </div>

                {/* Buttons near the bottom */}
                <div style={{ marginBottom: "60px" }}>
                    <Link
                        to="/itineraries" // Navigates to Itineraries page
                        style={{
                            display: "inline-block",
                            marginRight: "20px",
                            padding: "15px 30px",
                            backgroundColor: "#128C7E", // Dark WhatsApp green
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
                        Plan New Trip
                    </Link>
                    <Link
                        to="/saved-itineraries"
                        style={{
                            display: "inline-block",
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
                        View Saved Itineraries
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TripHome;
