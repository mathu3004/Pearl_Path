import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../index.css"; // Import external CSS

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

const Login = () => {
    const { auth, login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [error, setError] = useState("");

    useEffect(() => {
        if (auth.token && auth.user) {
            navigate(auth.user.role === "vendor" ? "/vendor-dashboard" : "/triphome");
        }
    }, [auth, navigate]);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(credentials);
        if (res.success) {
            navigate(res.role === "vendor" ? "/vendor-dashboard" : "/triphome");
        } else {
            setError(res.message);
        }
    };

    return (
        <>
            <Header />
            {/* Inject fade-in keyframes */}
            <style>{fadeInKeyframes}</style>
            <div id="login-container">
                <div id="login-overlay"></div>
                <div id="login-form-container">
                    <h2 id="login-title">Login</h2>
                    {error && <p id="login-error">{error}</p>}
                    <form id="login-form" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username-input">Username</label>
                            <input
                                id="username-input"
                                type="text"
                                name="username"
                                value={credentials.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password-input">Password</label>
                            <input
                                id="password-input"
                                type="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button id="login-button" type="submit">
                            Login
                        </button>
                    </form>

                    {/* Links in separate lines */}
                    <div id="login-links">
                        <p>
                            Don’t have an account? <Link to="/register">Register</Link>
                        </p>
                        <p>
                            <Link to="/reset-password">Forgot Password?</Link>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Login;
