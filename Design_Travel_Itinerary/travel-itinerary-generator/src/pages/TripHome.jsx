import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { AuthContext } from "../context/auth.context";
import Header from "../components/Header";
import Layout from '../components/Layout';
import Footer from "../components/Footer";
import "../index.css"; // Import the external CSS file

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
            {/* Inject fade-in keyframes */}
            <style>{fadeInKeyframes}</style>
            <div id="trip-home-container">
                {/* Dark Overlay */}
                <div id="trip-home-overlay" />
                {/* Main Content */}
                <div id="trip-home-content">
                    {/* Header Section */}
                    <header id="trip-home-header">
                        <h1 id="trip-home-header-title">PEARL PATH</h1>
                        <p id="trip-home-header-greeting">
                            Hi {userName || "Guest"}, Your Next Adventure Awaits!
                        </p>
                    </header>

                    {/* Slideshow Container */}
                    <div id="trip-home-slideshow">
                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                className="trip-home-slide"
                                style={{
                                    backgroundImage: `url("${slide.image}")`,
                                    opacity: currentSlide === index ? 1 : 0,
                                }}
                            >
                                <div className="trip-home-slide-overlay">
                                    <h2 className="trip-home-slide-title">{slide.title}</h2>
                                    <p className="trip-home-slide-content">{slide.content}</p>
                                </div>
                            </div>
                        ))}
                        {/* Left Chevron */}
                        <div id="trip-home-prev" onClick={prevSlide}>
                            <FaChevronLeft size={20} color="#fff" />
                        </div>
                        {/* Right Chevron */}
                        <div id="trip-home-next" onClick={nextSlide}>
                            <FaChevronRight size={20} color="#fff" />
                        </div>
                    </div>

                    {/* Dot Indicators */}
                    <div id="trip-home-dots-container">
                        {slides.map((_, index) => (
                            <span
                                key={index}
                                className={`trip-home-dot ${
                                    currentSlide === index ? "active" : ""
                                }`}
                                onClick={() => goToSlide(index)}
                            />
                        ))}
                    </div>

                    {/* Bottom Buttons */}
                    <div id="trip-home-buttons-container">
                        <Link id="trip-home-plan-trip" to="/itineraries">
                            Plan New Trip
                        </Link>
                    </div>
                </div>
            </div>
            <Header />
            <Footer />
             <Layout />
        </>
    );
};

export default TripHome;
