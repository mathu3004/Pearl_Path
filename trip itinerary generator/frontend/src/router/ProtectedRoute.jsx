import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";

const ProtectedRoute = ({ allowedRole, children }) => {
  const { auth } = useContext(AuthContext);

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && auth.user?.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
