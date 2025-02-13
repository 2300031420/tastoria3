import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithPopup, FacebookAuthProvider } from 'firebase/auth';

function SignIn() {
  const navigate = useNavigate();
  const auth = getAuth();
  const provider = new FacebookAuthProvider();

  const handleSuccessfulLogin = () => {
    const redirectPath = localStorage.getItem('redirectAfterLogin') || '/';
    localStorage.removeItem('redirectAfterLogin'); // Clean up
    navigate(redirectPath, { replace: true });
  };

  const handleFacebookLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      // The signed-in user info
      const user = result.user;
      // Facebook OAuth Access Token
      const credential = FacebookAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken;
      
      console.log("Successfully logged in with Facebook:", user);
      handleSuccessfulLogin();
    } catch (error) {
      console.error("Error during Facebook login:", error);
      // Handle Errors here
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used
      const email = error.customData?.email;
      // AuthCredential type that was used
      const credential = FacebookAuthProvider.credentialFromError(error);
    }
  };

  return (
    <div>
      {/* ... existing sign in methods ... */}
      <button 
        onClick={handleFacebookLogin}
        className="facebook-login-btn"
      >
        Sign in with Facebook
      </button>
      {/* ... rest of your component ... */}
    </div>
  );
}

export default SignIn; 