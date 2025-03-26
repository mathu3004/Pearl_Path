import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";

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
        {/* Inject fade-in keyframes */}
        <style>{fadeInKeyframes}</style>
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center pt-20"
            style={{
              backgroundImage: 'url("/LoginOption6.jpg")',
              filter: "brightness(0.9) contrast(1.1)",
              animation: "fadeIn 1s ease forwards",
              position: "relative",
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
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                zIndex: 1,
              }}
          />
          <div
              className="glass-container p-8 w-full max-w-md bg-white bg-opacity-80 rounded-lg shadow-lg"
              style={{ position: "relative", zIndex: 2 }}
          >
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
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                />
              </div>
              <button
                  type="submit"
                  className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
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
