import {
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { toast } from 'react-hot-toast';
import { FcGoogle } from "react-icons/fc";

export function SignUp() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOTP] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGoogleSignUp = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      console.log("Google Sign In Result:", result.user); // Debug log

      const userData = {
        name: result.user.displayName,
        email: result.user.email,
        googleId: result.user.uid,
        photoURL: result.user.photoURL,
        isGoogleUser: true
      };

      console.log("Sending user data to backend:", userData); // Debug log

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log("Backend Response:", data);

      if (response.ok) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          photoURL: data.user.photoURL,
          isGoogleUser: true
        }));

        // Store token if provided
        if (data.token) {
          localStorage.setItem('token', data.token);
        }

        toast.success(data.message || 'Google sign-up successful!');
        
        // Navigate to appropriate page
        if (data.message === 'User already exists') {
          navigate('/sign-in');
        } else {
          navigate('/sign-in'); // or wherever you want to redirect after successful signup
        }
      } else {
        throw new Error(data.message || 'Failed to register');
      }
    } catch (error) {
      console.error('Google signup error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-up cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Please allow popups for this website');
      } else {
        toast.error(error.message || 'Google sign-up failed. Please try again.');
      }
    }
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Basic validation
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        toast.error('All fields are required');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }

      // Send verification OTP
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/send-verification-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setTempUserId(data.tempUserId);
        setShowOTPInput(true);
        toast.success('OTP sent to your email');
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Submitting OTP verification:', { tempId: tempUserId, otp }); // Debug log

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-signup-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tempId: tempUserId,
          otp
        })
      });

      const data = await response.json();
      console.log('Verification response:', data); // Debug log

      if (response.ok) {
        toast.success('Account created successfully!');
        navigate('/sign-in');
      } else {
        toast.error(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Error in OTP verification:', error);
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="m-8 flex">
      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/Tastoria.jpg"
          className="h-full w-full object-cover rounded-3xl"
          alt="Tastoria"
        />
      </div>
      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Join Us</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            {showOTPInput ? 'Enter the verification code sent to your email.' : 'Enter your details to register.'}
          </Typography>
        </div>
        
        {/* Redesigned Google Sign Up Button */}
        <button
          onClick={handleGoogleSignUp}
          className="flex items-center justify-center gap-2 w-full max-w-sm px-6 py-3 mt-6 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
        >
          <FcGoogle className="w-5 h-5" />
          <span className="font-medium">Continue with Google</span>
        </button>

        <div className="w-full max-w-sm mt-6 mb-4 flex items-center justify-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {!showOTPInput ? (
          <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={handleInitialSubmit}>
            <div className="mb-4">
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Name
              </Typography>
              <Input
                size="lg"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>
            <div className="mb-4">
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Email
              </Typography>
              <Input
                size="lg"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@mail.com"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>
            <div className="mb-4">
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Password
              </Typography>
              <Input
                size="lg"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="********"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>
            <div className="mb-4">
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Confirm Password
              </Typography>
              <Input
                size="lg"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onPaste={(e) => {
                  e.preventDefault();
                  toast.error('Please type the password again for confirmation');
                }}
                placeholder="********"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>
            
            <Button 
              type="submit" 
              className="mt-6" 
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? "Sending OTP..." : "Create Account"}
            </Button>
          </form>
        ) : (
          <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={handleOTPVerification}>
            <div className="mb-4">
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Verification Code
              </Typography>
              <Input
                size="lg"
                value={otp}
                onChange={(e) => setOTP(e.target.value)}
                placeholder="Enter 6-digit code"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>
            
            <Button 
              type="submit" 
              className="mt-6" 
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify & Create Account"}
            </Button>

            <Button
              variant="text"
              className="mt-4"
              fullWidth
              onClick={() => setShowOTPInput(false)}
            >
              Change Details
            </Button>
          </form>
        )}

        <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
          Already have an account?
          <Link to="/sign-in" className="text-gray-900 ml-1">Sign in</Link>
        </Typography>
      </div>
    </section>
  );
}

export default SignUp;
