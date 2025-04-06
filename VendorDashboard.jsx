// src/pages/VendorDashboard.jsx
import React from "react";

const fadeInKeyframes = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

const VendorDashboard = () => {
    return (
        <>
            {/* Inject the fade-in animation keyframes */}
            <style>{fadeInKeyframes}</style>

            <div
                style={{
                    position: "relative",
                    minHeight: "100vh",
                    backgroundColor: "#0F4D4E", // Dark green background
                    fontFamily: "'Poppins', sans-serif",
                    animation: "fadeIn 1s ease forwards",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                    overflow: "hidden",
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
                        backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark overlay
                        zIndex: 1,
                    }}
                />

                {/* Glass-like Container */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 2,
                        padding: "40px",
                        maxWidth: "800px",
                        width: "100%",
                        backgroundColor: "rgba(255, 255, 255, 0.85)",
                        borderRadius: "10px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                        textAlign: "center",
                        backdropFilter: "blur(5px)",
                    }}
                >
                    <h2
                        style={{
                            fontSize: "2.5rem",
                            fontWeight: "bold",
                            marginBottom: "20px",
                            color: "#333",
                        }}
                    >
                        Vendor Dashboard
                    </h2>
                    <p
                        style={{
                            fontSize: "1.2rem",
                            color: "#555",
                            marginBottom: "20px",
                        }}
                    >
                        Manage your property listings, bookings, and analytics with ease.
                    </p>
                    {/* Additional vendor dashboard content can be added here */}
                </div>
            </div>
        </>
    );
};

export default VendorDashboard;
