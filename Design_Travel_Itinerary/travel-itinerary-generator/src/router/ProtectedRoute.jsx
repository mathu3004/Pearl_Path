// ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { auth } = useContext(AuthContext);

  if (!auth.token) {
    return <Navigate to="/" />;
  }

  const userRole = auth?.user?.role;
  const isAllowed = Array.isArray(allowedRole)
    ? allowedRole.includes(userRole)
    : userRole === allowedRole;

  if (!isAllowed) {
    return <Navigate to="/" />; // Or a 403 page
  }

  return children;
};

export default ProtectedRoute;