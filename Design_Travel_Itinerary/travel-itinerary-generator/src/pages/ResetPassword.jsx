import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../index.css"; // Import the external CSS file

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
            const res = await fetch("http://localhost:5002/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    newPassword: formData.newPassword,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("Password reset successfully. Please login with your new password.");
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
            <style>{fadeInKeyframes}</style>
            <div id="reset-password-container">
                <div id="reset-password-overlay"></div>
                <div id="reset-password-form-container">
                    <h2 id="reset-password-title">Reset Password</h2>
                    {error && <p id="reset-password-error">{error}</p>}
                    {message && <p id="reset-password-message">{message}</p>}
                    <form id="reset-password-form" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                id="newPassword"
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmNewPassword">Confirm New Password</label>
                            <input
                                id="confirmNewPassword"
                                type="password"
                                name="confirmNewPassword"
                                value={formData.confirmNewPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button id="reset-password-button" type="submit">
                            Reset Password
                        </button>
                    </form>
                    <div id="reset-password-links">
                        <Link to="/login">Back to Login</Link>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ResetPassword;