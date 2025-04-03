import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context.jsx";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../index.css"; // Adjust the path if needed

const LandingPage = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    // Redirect to TripHome if already authenticated
    useEffect(() => {
        if (auth?.token) {
            navigate("/triphome");
        }
    }, [auth, navigate]);

    return (
        <>
            <Header />
            <div id="landing-page-container">
                <div id="landing-page-overlay"></div>
                <div id="landing-page-content">
                    {/* Left Section: Headline and Call-to-Actions */}
                    <div id="landing-left">
                        <h1 id="landing-headline">Welcome to Pearl Path</h1>
                        <p id="landing-description">
                            Discover, create, and share itineraries with ease. Embark on your
                            next adventure with Pearl Path!
                        </p>
                        <div id="landing-cta-container">
                            <Link to="/register" className="landing-cta">
                                Sign Up
                            </Link>
                            <Link to="/" className="landing-cta">
                                Login
                            </Link>
                        </div>
                    </div>
                    {/* Right Section: Hero Image */}
                    <div id="landing-hero-container">
                        <img
                            src="/LandingPage1.jpg"
                            alt="Pearl Path Hero"
                            className="landing-hero-image"
                        />
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default LandingPage;
