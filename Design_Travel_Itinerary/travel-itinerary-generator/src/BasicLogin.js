import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, Loader2, ArrowRight } from "lucide-react";
import "./ItineararySelectionMode.css";
import { toast } from "sonner";
import axios from "axios";

const SignIn = () => {
  const [formData, setFormData] = useState({
    username: "", 
    password: "",
  });  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [passwordError, setPasswordError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    const newErrors = {
      username: !formData.username.trim(),
      password: !formData.password.trim(),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post("http://localhost:5003/signin", formData);
      localStorage.setItem("user", JSON.stringify(data));
      toast.success("Login successful!");
      navigate("/itinerarySelection");
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message === "Invalid credentials") {
        // Specific handling for incorrect password or credentials
        setPasswordError(true);
        toast.error("Incorrect password. Please try again.");
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="main">
    <div className="custom-signup-container">
      <div className="custom-signup-card">
        <div className="custom-signup-header">
          <Link to="/" className="navbar-logo-su">
          </Link>
          <h2 className="custom-signup-title">Sign In</h2>
          <p className="custom-signup-subtitle">
            Welcome back to Shrimple
          </p>
        </div>

        <form onSubmit={handleSubmit} className="custom-signup-form">
          <div className="custom-input-group">
            <label htmlFor="username" className="custom-input-label">
              Username
            </label>
            <div className="custom-input-container">
              <User className="custom-input-icon" size={18} />
              <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Joe3004"
                  className={`custom-input-field ${errors.username ? "error-class" : ""}`}
                />

            </div>
          </div>

          <div className="custom-input-group">
            <label htmlFor="password" className="custom-input-label">
              Password
            </label>
            <div className="custom-input-container">
              <Lock className="custom-input-icon" size={18} />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`custom-input-field ${passwordError  ? "error-class" : ""}`}
              />
            </div>
            {passwordError && <p className="error-message">Incorrect password. Please try again.</p>}
          </div>

          <button
            type="submit"
            className="custom-signup-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} className="btn-icon" />
              </>
            )}
          </button>
        </form>

        <div className="custom-signup-footer">
          <p>Don't have an account?</p>
          <Link to="/" className="custom-signin-link">
            <span>Create Account</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
};

export default SignIn;