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
import TravelItineraryGenerator from "./pages/TravelItineraryGenerator";
import UserDashboard from "./pages/UserDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import ProtectedRoute from "./router/ProtectedRoute";
import AboutUs from "./pages/AboutUs";

const AppContent = () => {
    const { auth, fetchProfile } = useContext(AuthContext);

    useEffect(() => {
        if (auth.token) {
            fetchProfile();
        }
    }, [auth.token, fetchProfile]);

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/triphome" element={<TripHome />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/itineraries" element={<Itineraries />} />
                    <Route path="/itinerary-generator" element={<ItineraryGenerator />} />
                    <Route
                        path="/radius-itinerary-generator"
                        element={<RadiusItineraryGenerator />}
                    />
                    <Route
                        path="/create-new-itinerary"
                        element={<TravelItineraryGenerator />}
                    />
                    <Route path="/about-us" element={<AboutUs />} />
                    <Route
                        path="/user-dashboard"
                        element={
                            <ProtectedRoute allowedRole="user">
                                <UserDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/vendor-dashboard"
                        element={
                            <ProtectedRoute allowedRole="vendor">
                                <VendorDashboard />
                            </ProtectedRoute>
                        }
                    />
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
