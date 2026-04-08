import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  return currentUser ? (
    children
  ) : (
    <Navigate
      to={`/login?redirect=${encodeURIComponent(
        location.pathname + location.search,
      )}`}
      replace
    />
  );
};

export default ProtectedRoute;
