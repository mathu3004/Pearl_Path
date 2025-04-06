import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../Navbar"; // Assuming this path is correct
import "../styles/styles.css";
import Footer from "../Footer"; // Assuming you have a Footer component correctly set up

const Home: React.FC = () => {
    return (
        <div>
            <Navbar />
            <div className="container">
                <h1>Welcome to Pearl Path</h1>
                <div className="links">
                    <Link to="/login">Login</Link> | <Link to="/create-account">Create Account</Link>
                </div>
            </div>
            <div className="about-section">
                <h2>About Pearl Path</h2>
                <p >Discover the beauty of planning your trips with ease and precision. Join us on your next adventure.</p>
            </div>
            <div className="features-section">
                <h2>Features</h2>
                <ul>
                    <li>Customizable Itineraries</li>
                    <li>Interactive Maps</li>
                    <li>User Reviews and Ratings</li>
                </ul>

                <h2>Features</h2>
                <ul>
                    <li>Customizable Itineraries</li>
                    <li>Interactive Maps</li>
                    <li>User Reviews and Ratings</li>
                </ul>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
