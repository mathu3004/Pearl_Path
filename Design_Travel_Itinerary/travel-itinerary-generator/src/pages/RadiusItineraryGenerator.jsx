import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../index.css"; // Make sure index.css is in your src folder or adjust the path accordingly

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
            <div id="radius-itinerary-container">
                {/* Dark Overlay */}
                <div id="radius-itinerary-overlay" />
                {/* Main Content */}
                <div id="radius-itinerary-content">
                    <h1 id="radius-itinerary-heading">
                        Itinerary Generator Based on Radius
                    </h1>
                    <p id="radius-itinerary-paragraph">
                        Select an option below to either create a new itinerary or modify an existing one.
                    </p>
                    <div id="radius-itinerary-button-container">
                        <Link
                            to="/radius-mode"
                            id="radius-create-itinerary-link"
                        >
                            Create New Itinerary
                        </Link>
                        <Link to="/modify-request/:username" id="radius-modify-itinerary-link">
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
