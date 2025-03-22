import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#d0b290]">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Check both auth context and localStorage
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const isAuthorized = isAuthenticated || (token && storedUser);

  if (!isAuthorized) {
    // Store the current path for redirect after login
    localStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 