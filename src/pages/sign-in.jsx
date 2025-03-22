import {
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { useState, useEffect } from "react";
import { toast } from 'react-hot-toast';

export function SignIn() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const message = location.state?.message;
  const from = location.state?.from;

  useEffect(() => {
    // If user is already logged in and there's a redirect path
    if (auth.currentUser && from) {
      navigate(from);
    }
  }, [auth.currentUser, from, navigate]);

  const handleSuccessfulLogin = (user) => {
    try {
      // Store user data in localStorage
      const userData = {
        email: user.email,
        uid: user.uid,
        displayName: user.displayName || email.split('@')[0],
        photoURL: user.photoURL
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', user.accessToken || 'mock-jwt-token');

      // Get the redirect path from localStorage or use default
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/preorder';
      // Clear the stored path
      localStorage.removeItem('redirectAfterLogin');
      // Navigate to the stored path
      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error('Error during login:', error);
      setError('An error occurred during login. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // First, check if email contains 'admin'
      if (email.toLowerCase().includes('admin')) {
        setError("Please use the admin login page to access administrator features.");
        setIsLoading(false);
        return;
      }

      // Make API call to backend
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store user data and token
      const userData = {
        email: data.user.email,
        uid: data.user.id,
        displayName: data.user.name || email.split('@')[0],
        isAdmin: false
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', data.token);

      // Show success toast
      toast.success('Signed in successfully!');

      // Get the redirect path or use default
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/';
      localStorage.removeItem('redirectAfterLogin');
      
      // Navigate to the stored path
      navigate(redirectPath, { replace: true });

    } catch (error) {
      console.error("Error signing in:", error);
      toast.error(error.message === 'Invalid email or password'
        ? "Invalid email or password"
        : "An error occurred during sign in"
      );
      setError(
        error.message === 'Invalid email or password'
          ? "Invalid email or password"
          : "An error occurred during sign in"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      console.log("Google sign-in result:", result.user); // Debug log
      
      // Send Google user data to backend
      const response = await fetch('http://localhost:5000/api/auth/google-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          uid: result.user.uid,
          token: await result.user.getIdToken()
        }),
      });

      const data = await response.json();
      console.log("Backend response:", data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || 'Google sign-in failed');
      }

      // Store user data with all necessary fields
      const userData = {
        id: data.user.id, // Use backend-generated ID
        email: result.user.email,
        uid: result.user.uid,
        displayName: result.user.displayName || result.user.email.split('@')[0],
        photoURL: result.user.photoURL || "/img/default-avatar.png",
        isAdmin: false,
        phoneNumber: result.user.phoneNumber || "",
        address: "",
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };

      console.log("Storing user data:", userData); // Debug log

      // Store user data and token from backend
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', data.token);

      toast.success('Signed in with Google successfully!');

      // Wait a brief moment to ensure data is stored
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get the redirect path or use default
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/profile';
      localStorage.removeItem('redirectAfterLogin');
      
      console.log("Navigating to:", redirectPath); // Debug log
      
      // Navigate to the stored path
      window.location.href = redirectPath;

    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error(error.message || "Google sign-in failed. Please try again.");
      setError(error.message || "Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setError("");
      const result = await signInWithPopup(auth, facebookProvider);
      
      // Send Facebook user data to backend
      const response = await fetch('http://localhost:5000/api/auth/facebook-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          uid: result.user.uid
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Facebook sign-in failed');
      }

      // Store user data
      const userData = {
        email: result.user.email,
        uid: result.user.uid,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        isAdmin: false
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', data.token);

      toast.success('Signed in with Facebook successfully!');
      handleSuccessfulLogin(result.user);
    } catch (error) {
      console.error("Facebook sign-in error:", error);
      toast.error("Facebook sign-in failed. Please try again.");
      setError("Facebook sign-in failed. Please try again.");
    }
  };

  return (
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Sign In</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">Enter your email and password to Sign In.</Typography>
        </div>

        {/* Show message if it exists */}
        {message && (
          <div className="mt-4 mb-8 mx-auto w-80 max-w-screen-lg lg:w-1/2">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <Typography variant="paragraph" color="blue" className="font-medium">
                {message}
              </Typography>
            </div>
          </div>
        )}

        <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2" onSubmit={handleSubmit}>
          {error && (
            <Typography variant="small" color="red" className="mb-4 text-center">
              {error}
            </Typography>
          )}
          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Your email
            </Typography>
            <Input
              size="lg"
              placeholder="name@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Password
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
          </div>
          <Button className="mt-6" fullWidth type="submit">
            Sign In
          </Button>

          <Button 
            variant="outlined"
            className="mt-2" 
            fullWidth 
            onClick={() => navigate('/admin-login')}
          >
            Admin Login
          </Button>

          <div className="space-y-4 mt-8">
            <Button 
              size="lg" 
              color="white" 
              className="flex items-center gap-2 justify-center shadow-md" 
              fullWidth
              onClick={handleGoogleSignIn}
            >
              <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1156_824)">
                  <path d="M16.3442 8.18429C16.3442 7.64047 16.3001 7.09371 16.206 6.55872H8.66016V9.63937H12.9813C12.802 10.6329 12.2258 11.5119 11.3822 12.0704V14.0693H13.9602C15.4741 12.6759 16.3442 10.6182 16.3442 8.18429Z" fill="#4285F4" />
                  <path d="M8.65974 16.0006C10.8174 16.0006 12.637 15.2922 13.9627 14.0693L11.3847 12.0704C10.6675 12.5584 9.7415 12.8347 8.66268 12.8347C6.5756 12.8347 4.80598 11.4266 4.17104 9.53357H1.51074V11.5942C2.86882 14.2956 5.63494 16.0006 8.65974 16.0006Z" fill="#34A853" />
                  <path d="M4.16852 9.53356C3.83341 8.53999 3.83341 7.46411 4.16852 6.47054V4.40991H1.51116C0.376489 6.67043 0.376489 9.33367 1.51116 11.5942L4.16852 9.53356Z" fill="#FBBC04" />
                  <path d="M8.65974 3.16644C9.80029 3.1488 10.9026 3.57798 11.7286 4.36578L14.0127 2.08174C12.5664 0.72367 10.6469 -0.0229773 8.65974 0.000539111C5.63494 0.000539111 2.86882 1.70548 1.51074 4.40987L4.1681 6.4705C4.8001 4.57449 6.57266 3.16644 8.65974 3.16644Z" fill="#EA4335" />
                </g>
                <defs>
                  <clipPath id="clip0_1156_824">
                    <rect width="16" height="16" fill="white" transform="translate(0.5)" />
                  </clipPath>
                </defs>
              </svg>
              <span>Sign in With Google</span>
            </Button>
            <Button 
              size="lg" 
              color="white" 
              className="flex items-center gap-2 justify-center shadow-md" 
              fullWidth
              onClick={handleFacebookSignIn}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Sign in With Facebook</span>
            </Button>
          </div>
          <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
            Not registered?
            <Link to="/sign-up" className="text-gray-900 ml-1">Create account</Link>
          </Typography>
        </form>
      </div>
      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/Tastoria.jpg"
          className="h-full w-full object-cover rounded-3xl"
          alt="Tastoria"
        />
      </div>
    </section>
  );
}

export default SignIn;
