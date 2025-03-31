import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const fadeInKeyframes = `
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

const AboutUs = () => {
    return (
        <>
            {/* Inject the fade-in keyframes so they are available globally */}
            <style>{fadeInKeyframes}</style>

            {/* Header component */}
            <Header />

            {/* Main content area */}
            <div
                style={{
                    padding: "80px",
                    fontFamily: "'Poppins', sans-serif",
                    backgroundColor: "#f9f9f9",
                    minHeight: "calc(100vh - 140px)", // assuming header and footer are ~70px each
                }}
            >
                <h1
                    style={{
                        textAlign: "center",
                        marginBottom: "40px",
                        color: "#333",
                        fontWeight: "bold",
                        animation: "fadeIn 1s ease forwards",
                    }}
                >
                    About Us
                </h1>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        maxWidth: "800px",
                        margin: "0 auto",
                    }}
                >
                    {/* Mathusha's Container */}
                    <div
                        style={{
                            background: "#fff",
                            padding: "20px",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            opacity: 0,
                            animation: "fadeIn 1s ease forwards",
                            animationDelay: "0.2s",
                        }}
                    >
                        <h2 style={{ marginTop: 0, color: "#128C7E" }}>
                            Mathusha Kannathasan
                        </h2>
                        <p style={{ color: "#555", lineHeight: 1.6 }}>
                            Developed an innovative model for trip plan generation based on a geographical radius.
                            His work ensures that itineraries are tailored to nearby attractions and optimized for a personalized travel experience.
                        </p>
                    </div>

                    {/* Ehansa's Container */}
                    <div
                        style={{
                            background: "#fff",
                            padding: "20px",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            opacity: 0,
                            animation: "fadeIn 1s ease forwards",
                            animationDelay: "0.4s",
                        }}
                    >
                        <h2 style={{ marginTop: 0, color: "#128C7E" }}>
                            Ehansa Gajanayake
                        </h2>
                        <p style={{ color: "#555", lineHeight: 1.6 }}>
                            Contributed significantly to the development of the trip plan generation model,
                            ensuring each itinerary is dynamically tailored to individual preferences for an exceptional travel experience.
                        </p>
                    </div>

                    {/* Denuri's Container */}
                    <div
                        style={{
                            background: "#fff",
                            padding: "20px",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            opacity: 0,
                            animation: "fadeIn 1s ease forwards",
                            animationDelay: "0.6s",
                        }}
                    >
                        <h2 style={{ marginTop: 0, color: "#128C7E" }}>
                            Denuri Manage
                        </h2>
                        <p style={{ color: "#555", lineHeight: 1.6 }}>
                            Spearheaded the development of an intelligent Chatbot that provides travel assistance,
                            enhancing user interaction and streamlining customer support.
                        </p>
                    </div>

                    {/* Neelia's Container */}
                    <div
                        style={{
                            background: "#fff",
                            padding: "20px",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            opacity: 0,
                            animation: "fadeIn 1s ease forwards",
                            animationDelay: "0.8s",
                        }}
                    >
                        <h2 style={{ marginTop: 0, color: "#128C7E" }}>
                            Neelia Makuloluwa
                        </h2>
                        <p style={{ color: "#555", lineHeight: 1.6 }}>
                            Designed and implemented a user-friendly, visually engaging frontend
                            that ensures a seamless and intuitive experience across the platform.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer component */}
            <Footer />
        </>
    );
};

export default AboutUs;
