import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Navbar as MTNavbar,
  Collapse,  // Replace MobileNav with Collapse
  Typography,
  Button,
  IconButton,
} from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useCallback } from 'react';

const routes = [
  {
    name: "Book Table",
    path: "/cafes",
    icon: null,
  },
];
// Add SameSite and Secure attributes to cookies
const setSecureCookie = (name, value, options = {}) => {
  document.cookie = `${name}=${value}; SameSite=Strict; Secure; ${Object.entries(options).map(([k, v]) => `${k}=${v}`).join('; ')}`;
};

export function Navbar({ brandName, routes, action }) {
  const [openNav, setOpenNav] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const auth = getAuth();
  const navigate = useNavigate();
  const [cartQuantity, setCartQuantity] = useState(0);
  useEffect(() => {
    let isSubscribed = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isSubscribed) return;

      try {
        const storedUser = localStorage.getItem("user");
        const isFirebaseAuth = !!firebaseUser;
        const isLocalAuth = !!storedUser;
        
        if (isFirebaseAuth) {
          setUser(firebaseUser);
          const userData = {
            email: firebaseUser.email,
            uid: firebaseUser.uid
          };
          // Use sessionStorage for sensitive data
          sessionStorage.setItem("user", JSON.stringify(userData));
          // Use localStorage only for non-sensitive data
          localStorage.setItem("userPreferences", JSON.stringify({
            theme: 'light',
            language: 'en'
          }));
          setIsAuthenticated(true);
        } else if (isLocalAuth) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          
          const redirectPath = sessionStorage.getItem('redirectAfterLogin');
          if (redirectPath && location.pathname !== '/sign-in') {
            sessionStorage.removeItem('redirectAfterLogin');
            navigateWithTransition('/sign-in');
          }
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setUser(null);
        setIsAuthenticated(false);
      }
    });
  return () => {
    isSubscribed = false;
    unsubscribe();
  };
}, [auth, navigate, location]);
  const navigateWithTransition = useCallback((to) => {
    if (typeof window.requestIdleCallback === 'function') {
      requestIdleCallback(() => navigate(to, { replace: true }));
    } else {
      setTimeout(() => navigate(to, { replace: true }), 0);
    }
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear all localStorage items
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('redirectAfterLogin');
      
      // Clear any cart data
      if (auth.currentUser?.uid) {
        localStorage.removeItem(`cart_${auth.currentUser.uid}`);
      }
      
      // Reset states
      setIsAuthenticated(false);
      setUser(null);
      setCartQuantity(0);

      // Navigate to home page
      navigate('/', { replace: true });
      
      // Reload the page to ensure all states are reset
      window.location.reload();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    // Check both Firebase auth and local storage for authentication
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        const storedUser = localStorage.getItem("user");
        const isFirebaseAuth = !!firebaseUser;
        const isLocalAuth = !!storedUser;
        
        setIsAuthenticated(isFirebaseAuth || isLocalAuth);
        
        if (isFirebaseAuth) {
          setUser(firebaseUser);
          // Store user data after ensuring we have all necessary information
          const userData = {
            email: firebaseUser.email,
            uid: firebaseUser.uid
          };
          localStorage.setItem("user", JSON.stringify(userData));
        } else if (isLocalAuth) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setUser(null);
        setIsAuthenticated(false);
      }
    });
    return () => {
      try {
        unsubscribe();
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    };
  }, [auth]);
  useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false)
    );
  }, []);
  useEffect(() => {
    const updateCartQuantity = () => {
      if (auth.currentUser) {
        const savedCart = localStorage.getItem(`cart_${auth.currentUser.uid}`);
        if (savedCart) {
          const cartItems = JSON.parse(savedCart);
          const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
          setCartQuantity(totalQuantity);
        } else {
          setCartQuantity(0);
        }
      }
    };
  // Initial cart quantity update
    updateCartQuantity();
  // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('cart_')) {
        updateCartQuantity();
      }
    };
    window.addEventListener('storage', handleStorageChange);
  // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        updateCartQuantity();
      } else {
        setCartQuantity(0);
      }
    });
  // Custom event listener for cart updates
    const handleCartUpdate = () => updateCartQuantity();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
      unsubscribe();
    };
  }, [auth]);
  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 text-inherit lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      {routes.map(({ name, path, icon, href, target }, index) => (
        <Typography
          key={`nav-${name}-${index}`}
          as="li"
          variant="small"
          color="inherit"
          className="capitalize"
        >
          {href ? (
            <a
              href={href}
              target={target}
              className="flex items-center gap-1 p-1 font-bold"
            >
              {icon && React.createElement(icon, {
                className: "w-[18px] h-[18px] opacity-75 mr-1",
                key: `icon-${name}-${index}`
              })}
              {name}
            </a>
          ) : (
            <Link
              to={path}
              target={target}
              className="flex items-center gap-1 p-1 font-bold"
            >
              {icon && React.createElement(icon, {
                className: "w-[18px] h-[18px] opacity-75 mr-1",
                key: `icon-${name}-${index}`
              })}
              {name}
            </Link>
          )}
        </Typography>
      ))}
      {isAuthenticated && user?.email && (
        <Typography
          key="user-email-nav"
          as="li"
          variant="small"
          color="inherit"
          className="capitalize"
        >
          <span className="p-1 font-bold">
           {/*Welcome, {user.email}*/}
          </span>
        </Typography>
      )}
    </ul>
  );
  return (
    <MTNavbar color="transparent" className="p-3">
      <div className="container mx-auto flex items-center justify-between text-white">
        {isHomePage && (
          <Link to="/">
            <img 
              src="/img/logo.png" 
              alt="Tastoria Logo" 
              className="h-32 w-60 mr-4 ml-2 cursor-pointer py-1.5 opacity-90 backdrop-blur-sm"
            />
          </Link>
        )}
        <div className="hidden lg:flex items-center ml-auto">{navList}</div>
        
        {isAuthenticated ? (
          <div className="hidden gap-2 lg:flex items-center">
            <Button 
              variant="text" 
              size="sm" 
              color="white" 
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
            <Link to="/cart" className="relative">
              <ShoppingCartIcon className="h-6 w-6 text-white" />
              {cartQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {cartQuantity}
                </span>
              )}
            </Link>
          </div>
        ) : (
          <div className="hidden gap-2 lg:flex">
            <Link to="/sign-in">
              <Button variant="text" size="sm" color="white">
                Sign In
              </Button>
            </Link>
            {React.cloneElement(action, {
              className: "hidden lg:inline-block",
            })}
          </div>
        )}
        <IconButton
          variant="text"
          size="sm"
          color="white"
          className="ml-auto text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <XMarkIcon strokeWidth={2} className="h-6 w-6" />
          ) : (
            <Bars3Icon strokeWidth={2} className="h-6 w-6" />
          )}
        </IconButton>
      </div>
      <Collapse open={openNav}>
        <div className="container mx-auto bg-white/90 rounded-xl mt-4 p-4">
          <div className="flex flex-col gap-4">
            <ul className="flex flex-col gap-2">
              {routes.map(({ name, path, icon }, index) => (
                <Typography
                  key={`mobile-${name}-${index}`}
                  as="li"
                  variant="small"
                  color="blue-gray"
                  className="p-1 font-normal"
                >
                  <Link to={path} className="flex items-center">
                    {icon && React.createElement(icon, {
                      className: "w-5 h-5 mr-2",
                      key: `mobile-icon-${name}-${index}`
                    })}
                    {name}
                  </Link>
                </Typography>
              ))}
            </ul>
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link to="/cart" className="flex items-center gap-2">
                  <ShoppingCartIcon className="h-6 w-6" />
                  <Typography color="blue-gray">Cart ({cartQuantity})</Typography>
                </Link>
                <Button 
                  variant="text" 
                  size="sm" 
                  color="blue-gray"
                  onClick={handleSignOut}
                  fullWidth
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/sign-in">
                  <Button variant="text" size="sm" color="blue-gray" fullWidth>
                    Sign In
                  </Button>
                </Link>
                {action}
              </div>
            )}
          </div>
        </div>
      </Collapse>
    </MTNavbar>
  );
}

Navbar.defaultProps = {
  brandName: <img src="/img/Tastoria.jpg" alt="Tastoria Logo" className="h-8" />,
  action: (
    <Link to="/sign-up">
      <Button variant="gradient" size="sm" fullWidth>
        Sign Up
      </Button>
    </Link>
  ),
};

Navbar.propTypes = {
  brandName: PropTypes.node,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
  action: PropTypes.node,
};

Navbar.displayName = "/src/widgets/layout/navbar.jsx";

export default Navbar;
