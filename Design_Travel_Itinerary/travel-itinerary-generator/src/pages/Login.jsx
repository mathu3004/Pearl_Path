import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/auth.context";

const Login = () => {
    const { auth, login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
    });
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
            <div id="login-container">
                <div id="login-overlay"></div>
                <div id="login-form-container">
                    <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-1 font-semibold">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={credentials.username}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-semibold">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>
                        <button type="submit" className="form-button">
                            Login
                        </button>
                    </form>
                    <div className="mt-4 flex flex-col items-center gap-2">
                        <Link to="/register" className="text-blue-600 hover:underline">
                            Don't have an account? Register
                        </Link>
                        <Link to="/reset-password" className="text-blue-600 hover:underline">
                            Forgot Password?
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
