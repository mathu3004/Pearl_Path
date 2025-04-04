// src/App.js
import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/auth.context";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import TripHome from "./pages/TripHome";
import Profile from "./pages/Profile";
import Itineraries from "./pages/Itineraries";
import ItineraryGenerator from "./pages/ItineraryGenerator";
import RadiusItineraryGenerator from "./pages/RadiusItineraryGenerator";
import UserDashboard from "./pages/UserDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import ProtectedRoute from "./router/ProtectedRoute";
import AboutUs from "./pages/AboutUs";

import RadiusTravelItineraryGenerator from "./RadiusTravelItineraryGenerator";
import RadiusTravelItinerary from "./RadiusVisual";
import RadiusModify from "./RadiusModify";
import TravelItineraryGenerator from './TravelItineraryGenerator';
import RadiusModifyRequest from "./RadiusModifyRequest";
import VisualizationItinerary from "./VisualizationItinerary";
import ModifyItinerary from "./ModifyItinerary";
import NormalModifyRequest from "./ModifyRequest";

const AppContent = () => {
    const { auth, fetchProfile } = useContext(AuthContext);

    useEffect(() => {
        if (auth.token) {
            fetchProfile();
        }
        // ❌ Do NOT redirect in useEffect — leave that to <ProtectedRoute>
    }, [auth.token, fetchProfile]);

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/about-us" element={<AboutUs />} />
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes */}
                    <Route path="/triphome" element={
                        <ProtectedRoute allowedRole="user">
                            <TripHome />
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute allowedRole="user">
                            <Profile />
                        </ProtectedRoute>
                    } />
                    <Route path="/itineraries" element={
                        <ProtectedRoute allowedRole="user">
                            <Itineraries />
                        </ProtectedRoute>
                    } />
                    <Route path="/itinerary-generator" element={
                        <ProtectedRoute allowedRole="user">
                            <ItineraryGenerator />
                        </ProtectedRoute>
                    } />
                    <Route path="/radius-itinerary-generator" element={
                        <ProtectedRoute allowedRole="user">
                            <RadiusItineraryGenerator />
                        </ProtectedRoute>
                    } />
                    <Route path="/user-dashboard" element={
                        <ProtectedRoute allowedRole="user">
                            <UserDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/vendor-dashboard" element={
                        <ProtectedRoute allowedRole="vendor">
                            <VendorDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Itinerary System Routes */}
                    <Route path="/radius-mode" element={<RadiusTravelItineraryGenerator />} />
                    <Route path="/no-radius-mode" element={<TravelItineraryGenerator />} />
                    <Route path="/visual-radius/:username/:name" element={<RadiusTravelItinerary />} />
                    <Route path="/visual/:username/:itinerary_name" element={<VisualizationItinerary />} />
                    <Route path="/modify-radius/:username/:name" element={<RadiusModify />} />
                    <Route path="/modify-request/:username" element={<RadiusModifyRequest />} />
                    <Route path="/modify/:username/:itinerary_name" element={<ModifyItinerary />} />
                    <Route path="/normal-modify-request/:username" element={<NormalModifyRequest />} />

                    {/* Fallback */}
                    <Route path="*" element={<LandingPage />} />
                </Routes>
            </main>
        </div>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
};

export default App;