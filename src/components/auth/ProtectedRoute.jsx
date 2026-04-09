import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show loader while checking session
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Checking session...</p>
      </div>
    );
  }

  // redirect to login with return path
  if (!currentUser) {
    const redirectPath = encodeURIComponent(
      location.pathname + location.search,
    );

    return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
  }

  // render protected content
  return children;
};

export default ProtectedRoute;
