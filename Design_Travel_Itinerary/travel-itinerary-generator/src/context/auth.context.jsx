import React, { createContext, useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: null, user: null, loading: true });

  const login = async ({ username, password }) => {
    try {
      const res = await fetch("http://localhost:5002/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.accessToken);
        const decoded = jwtDecode(data.accessToken);
        setAuth({ token: data.accessToken, user: decoded, loading: false });
        return { success: true, role: decoded.role };
      } else {
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Server error" };
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch("http://localhost:5002/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: data.message };
      } else {
        return {
          success: false,
          message: data.message || "Registration failed",
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "Server error" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuth({ token: null, user: null, loading: false });
  };

  const fetchProfile = async () => {
    if (!auth.token || !auth.user) return null;
    const userId = auth.user.id || auth.user._id || auth.user.userId;
    if (!userId) {
      console.error("User ID not found in token", auth.user);
      return null;
    }
    try {
      const res = await fetch(`http://localhost:5002/api/profile/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const data = await res.json();
      if (res.ok) return data;
      console.error("Error fetching profile:", data.message);
      return null;
    } catch (error) {
      console.error("Fetch profile error:", error);
      return null;
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        setAuth({ token: storedToken, user: decoded, loading: false });
      } catch (error) {
        console.error("Token decode error:", error);
        setAuth({ token: null, user: null, loading: false });
      }
    } else {
      setAuth({ token: null, user: null, loading: false });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ auth, login, register, logout, fetchProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
