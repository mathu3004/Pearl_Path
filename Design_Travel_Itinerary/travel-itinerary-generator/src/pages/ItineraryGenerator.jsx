import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Layout from '../components/Layout';
import Footer from "../components/Footer";
import "../index.css";

const ItineraryGenerator = () => {
    return (
        <>
            <Header />
            <div id="itinerary-generator-container">
                {/* Dark Overlay */}
                <div id="itinerary-generator-overlay" />
                {/* Main Content */}
                <div id="itinerary-generator-content">
                    <h1 id="itinerary-generator-heading">Itinerary Generator</h1>
                    <p id="itinerary-generator-paragraph">
                        Select an option below to either create a new itinerary or modify an existing one.
                    </p>
                    <div id="itinerary-generator-button-container">
                        <Link to="/no-radius-mode" id="create-itinerary-link">
                            Create New Itinerary
                        </Link>
                        <Link to="/normal-modify-request/:username" id="modify-itinerary-link">
                            Modify Itinerary
                        </Link>
                    </div>
                </div>
            </div>
                    <Layout />
            <Footer />
        </>
    );
};

export default ItineraryGenerator;
