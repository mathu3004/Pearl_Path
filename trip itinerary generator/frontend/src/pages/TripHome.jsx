import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
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

const slides = [
    {
        title: "Handpicked Destinations",
        content:
            "Discover the true beauty of Sri Lanka. We focus on four breathtaking cities — Kandy, Ella, Nuwara Eliya, and Colombo — each offering unique experiences that capture local charm. Enjoy handpicked adventures, from misty hills to vibrant cityscapes, designed just for you.",
        image: "/Beach.jpeg",
    },
    {
        title: "Fully Personalized Travel Plans",
        content:
            "No more generic tours. We craft travel itineraries that match your interests, budget, and schedule, ensuring every journey is uniquely yours. Just share your preferences, and we'll design a trip that feels tailor-made to inspire and delight.",
        image: "/CoconutTrees.jpeg",
    },
    {
        title: "Seamless Journey Optimization",
        content:
            "Travel smarter, not farther. Our system clusters attractions, dining, and accommodations in close proximity so you spend less time commuting and more time exploring. Enjoy every moment of your journey with an itinerary that brings your favorite experiences just around the corner.",
        image: "/LordBuddha.jpeg",
    },
    {
        title: "Travel Made Simple & Connected",
        content:
            "Plan, ask, and connect with ease. Our intuitive chat assistant offers instant answers and direct connections with hotels, restaurants, and local guides, ensuring a seamless travel experience. All your travel needs are met in one convenient, stress-free platform.",
        image: "/Fishermen.jpeg",
    },
];

const center = { lat: 6.9271, lng: 79.8612 };
const mapContainerStyle = {
    width: "100%",
    height: "700px",
    borderRadius: "20px",
};

const TripHome = () => {
    const { auth, fetchProfile } = useContext(AuthContext);
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [userName, setUserName] = useState("");

    // Redirect if not authenticated
    useEffect(() => {
        if (!auth?.token) {
            navigate("/login");
        }
    }, [auth, navigate]);

    // Retrieve current user's profile to extract the username
    useEffect(() => {
        async function loadProfile() {
            const profile = await fetchProfile();
            if (profile && profile.user) {
                setUserName(profile.user.username);
            }
        }
        loadProfile();
    }, [fetchProfile]);

    // Auto-slide every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

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
                    overflow: "hidden",
                    backgroundImage: 'url("/Lighthouse.jpeg")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    animation: "fadeIn 1s ease forwards",
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
                        backgroundColor: "rgba(0,0,0,0.5)",
                        zIndex: 1,
                    }}
                />
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
                    {/* Inner Header Section with Greeting */}
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
                            Hi {userName || "Guest"}, Your Next Adventure Awaits!
                        </p>
                    </header>

                    {/* Slideshow Container */}
                    <div
                        style={{
                            position: "relative",
                            width: "80%",
                            maxWidth: "1000px",
                            height: "400px",
                            margin: "40px 0",
                            borderRadius: "10px",
                            overflow: "hidden",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                        }}
                    >
                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    backgroundImage: `url("${slide.image}")`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    backgroundRepeat: "no-repeat",
                                    opacity: currentSlide === index ? 1 : 0,
                                    transition: "opacity 0.8s ease-in-out",
                                }}
                            >
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
                                    <h2
                                        style={{
                                            fontSize: "1.8rem",
                                            fontWeight: "bold",
                                            margin: 0,
                                            color: "#fff",
                                        }}
                                    >
                                        {slide.title}
                                    </h2>
                                    <p style={{ fontSize: "1rem", marginTop: "10px", color: "#fff" }}>
                                        {slide.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {/* Left Chevron */}
                        <div
                            onClick={prevSlide}
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "10px",
                                transform: "translateY(-50%)",
                                cursor: "pointer",
                                backgroundColor: "rgba(0,0,0,0.5)",
                                padding: "10px",
                                borderRadius: "50%",
                                zIndex: 4,
                            }}
                        >
                            <FaChevronLeft size={20} color="#fff" />
                        </div>
                        {/* Right Chevron */}
                        <div
                            onClick={nextSlide}
                            style={{
                                position: "absolute",
                                top: "50%",
                                right: "10px",
                                transform: "translateY(-50%)",
                                cursor: "pointer",
                                backgroundColor: "rgba(0,0,0,0.5)",
                                padding: "10px",
                                borderRadius: "50%",
                                zIndex: 4,
                            }}
                        >
                            <FaChevronRight size={20} color="#fff" />
                        </div>
                    </div>

                    {/* Dot Indicators */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: "20px",
                            width: "100%",
                            textAlign: "center",
                            zIndex: 4,
                        }}
                    >
                        {slides.map((_, index) => (
                            <span
                                key={index}
                                onClick={() => goToSlide(index)}
                                style={{
                                    display: "inline-block",
                                    width: "10px",
                                    height: "10px",
                                    margin: "0 5px",
                                    borderRadius: "50%",
                                    backgroundColor:
                                        currentSlide === index ? "#fff" : "rgba(255, 255, 255, 0.5)",
                                    cursor: "pointer",
                                }}
                            />
                        ))}
                    </div>

                    {/* Buttons near the bottom */}
                    <div style={{ marginBottom: "60px" }}>
                        <Link
                            to="/itineraries"
                            style={{
                                display: "inline-block",
                                marginRight: "20px",
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
            <Footer />
        </>
    );
};

export default TripHome;
