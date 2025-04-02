import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../index.css"; // Import the external CSS file

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        username: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmNewPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const res = await fetch("http://localhost:5001/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    newPassword: formData.newPassword,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(
                    "Password reset successfully. Please login with your new password."
                );
            } else {
                setError(data.message || "Reset password failed");
            }
        } catch (err) {
            console.error("Reset Password error:", err);
            setError("Server error");
        }
    };

    return (
        <>
            <Header />
            {/* Inject fade-in keyframes */}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
            <div id="reset-password-container">
                <div id="reset-password-overlay"></div>
                <div id="reset-password-form-container">
                    <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    {message && (
                        <p className="text-green-600 text-center mb-4">{message}</p>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-1 font-semibold">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-semibold">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-semibold">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                name="confirmNewPassword"
                                value={formData.confirmNewPassword}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                            Reset Password
                        </button>
                    </form>
                    <div className="mt-4 text-center">
                        <Link to="/login" className="text-blue-600 hover:underline">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ResetPassword;
