import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const AboutUs = () => {
    return (
        <>
            <Header />
            <div id="about-us-container">
                <h1 id="about-us-title">About Us</h1>
                <div id="about-us-content">
                    {/* Mathusha's Container */}
                    <div className="team-member-card" style={{ animationDelay: "0.2s" }}>
                        <img
                            src="/Mathusha.jpeg"
                            alt="Mathusha Kannathasan"
                            className="team-member-image"
                        />
                        <h2 className="team-member-name">Mathusha Kannathasan</h2>
                        <p className="team-member-bio">
                            Developed an innovative model for trip plan generation based on a
                            geographical radius. His work ensures that itineraries are tailored
                            to nearby attractions and optimized for a personalized travel
                            experience.
                        </p>
                    </div>

                    {/* Ehansa's Container */}
                    <div className="team-member-card" style={{ animationDelay: "0.4s" }}>
                        <img
                            src="/Ehansa.jpeg"
                            alt="Ehansa Gajanayake"
                            className="team-member-image"
                        />
                        <h2 className="team-member-name">Ehansa Gajanayake</h2>
                        <p className="team-member-bio">
                            Contributed significantly to the development of the trip plan
                            generation model, ensuring each itinerary is dynamically tailored to
                            individual preferences for an exceptional travel experience.
                        </p>
                    </div>

                    {/* Denuri's Container */}
                    <div className="team-member-card" style={{ animationDelay: "0.6s" }}>
                        <img
                            src="/Denuri.jpeg"
                            alt="Denuri Manage"
                            className="team-member-image"
                        />
                        <h2 className="team-member-name">Denuri Manage</h2>
                        <p className="team-member-bio">
                            Spearheaded the development of an intelligent Chatbot that provides
                            travel assistance, enhancing user interaction and streamlining
                            customer support.
                        </p>
                    </div>

                    {/* Neelia's Container */}
                    <div className="team-member-card" style={{ animationDelay: "0.8s" }}>
                        <img
                            src="/neelia.jpeg"
                            alt="Neelia Makuloluwa"
                            className="team-member-image"
                        />
                        <h2 className="team-member-name">Neelia Makuloluwa</h2>
                        <p className="team-member-bio">
                            Designed and implemented a user-friendly, visually engaging frontend
                            that ensures a seamless and intuitive experience across the
                            platform.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AboutUs;
