import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: null, user: null, loading: true });

  const logout = () => {
    localStorage.removeItem("token");
    setAuth({ token: null, user: null, loading: false });
  };

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
        return { success: false, message: data.message || "Registration failed" };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "Server error" };
    }
  };

  const fetchProfile = async () => {
    if (!auth.token || !auth.user) return null;
    const userId = auth.user.id || auth.user._id || auth.user.userId;
    if (!userId) {
      logout(); // Token is invalid
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
      if (res.status === 401 || res.status === 403) {
        logout(); // Expired or invalid token
        return null;
      }
      const data = await res.json();
      return res.ok ? data : null;
    } catch (error) {
      console.error("Server unreachable, logging out:", error);
      logout(); // Server not reachable
      return null;
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        const isExpired = decoded.exp * 1000 < Date.now();
        if (isExpired) {
          logout(); // Token expired
        } else {
          setAuth({ token: storedToken, user: decoded, loading: false });
        }
      } catch (error) {
        console.error("Token decode error:", error);
        logout();
      }
    } else {
      setAuth({ token: null, user: null, loading: false });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, register, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};