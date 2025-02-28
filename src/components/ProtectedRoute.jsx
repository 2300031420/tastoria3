import { Navigate, useLocation } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const auth = getAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check Firebase authentication
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        // If no Firebase user, check localStorage
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!storedUser && !!token);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#d0b290]">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted URL
    return <Navigate to="/sign-in" state={{ returnUrl: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute; 