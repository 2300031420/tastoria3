import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Navbar as MTNavbar,
  MobileNav,
  Typography,
  Button,
  IconButton,
} from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const routes = [
  {
    name: "Book Table",
    path: "/cafes",
    icon: null,
  },
];

export function Navbar({ brandName, routes, action }) {
  const [openNav, setOpenNav] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const auth = getAuth();
  const navigate = useNavigate();
  const [cartQuantity, setCartQuantity] = useState(0);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, [auth]);

  React.useEffect(() => {
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

    // Listen for storage changes (when cart is updated in other components)
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

  const handleNavClick = (e, path) => {
    if (path.startsWith('/#')) {
      e.preventDefault();
      const element = document.getElementById(path.substring(2));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      setOpenNav(false);
    }
  };

  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 text-inherit lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      {routes.map(({ name, path, icon, href, target }) => (
        <Typography
          key={name}
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
              {icon &&
                React.createElement(icon, {
                  className: "w-[18px] h-[18px] opacity-75 mr-1",
                })}
              {name}
            </a>
          ) : (
            <Link
              to={path}
              onClick={(e) => handleNavClick(e, path)}
              target={target}
              className="flex items-center gap-1 p-1 font-bold"
            >
              {icon &&
                React.createElement(icon, {
                  className: "w-[18px] h-[18px] opacity-75 mr-1",
                })}
              {name}
            </Link>
          )}
        </Typography>
      ))}
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
          <div className="hidden gap-2 lg:flex">
            <Button 
              variant="text" 
              size="sm" 
              color="white" 
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden gap-2 lg:flex">
              <Link
                to="/sign-in"
                className="flex items-center"
              >
                <Button variant="text" size="sm" color="white" fullWidth>
                  Sign In
                </Button>
              </Link>
              {React.cloneElement(action, {
                className: "hidden lg:inline-block",
              })}
            </div>
          </>
        )}
        
        {isAuthenticated && (
          <Link to="/cart" className="flex items-center gap-1 relative">
            <ShoppingCartIcon className="h-6 w-6 text-white" />
            {cartQuantity > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {cartQuantity}
              </span>
            )}
          </Link>
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
      <MobileNav
        className="rounded-xl bg-white px-4 pt-2 pb-4 text-blue-gray-900"
        open={openNav}
      >
        <div className="container mx-auto">
          {navList}
          {isAuthenticated ? (
            <Button 
              variant="text" 
              size="sm" 
              fullWidth
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          ) : (
            <>
              <Link
                to="/sign-in"
                className="mb-2 block"
              >
                <Button variant="text" size="sm" fullWidth>
                  Sign In
                </Button>
              </Link>
              {React.cloneElement(action, {
                className: "w-full block",
              })}
            </>
          )}
        </div>
      </MobileNav>
    </MTNavbar>
  );
}

Navbar.defaultProps = {
  brandName: <img src="/img/Tastoria.jpg" alt="Tastoria Logo" className="h-8" />,
  action: (
    <Link
      to="/sign-up"
    >
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
