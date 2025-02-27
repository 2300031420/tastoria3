import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  if (!user || !token) {
    // Save the attempted URL
    return <Navigate to="/sign-in" state={{ returnUrl: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute; 