import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const VendorDashboard = () => {
    return (
        <>
            <Header />
            <div id="vendor-dashboard-container">
                <div id="vendor-dashboard-overlay"></div>
                <div id="vendor-dashboard-content">
                    <h2 id="vendor-dashboard-title">Vendor Dashboard</h2>
                    <p id="vendor-dashboard-text">
                        Manage your property listings, bookings, and analytics with ease.
                    </p>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default VendorDashboard;