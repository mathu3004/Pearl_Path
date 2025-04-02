import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const VendorDashboard = () => {
    return (
        <>
            <div id="vendor-dashboard-container">
                <div id="vendor-dashboard-overlay"></div>
                <div id="vendor-dashboard-content">
                    <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "20px", color: "#333" }}>
                        Vendor Dashboard
                    </h2>
                    <p style={{ fontSize: "1.2rem", color: "#555", marginBottom: "20px" }}>
                        Manage your property listings, bookings, and analytics with ease.
                    </p>
                </div>
            </div>
        </>
    );
};

export default VendorDashboard;
