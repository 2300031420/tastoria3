import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FacebookAuthProvider, GoogleAuthProvider } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBevdS_e5G_DPwehEm1G1tGUDJjQWAKgKA",
  authDomain: "testoria-ba217.firebaseapp.com",
  projectId: "testoria-ba217",
  storageBucket: "testoria-ba217.firebasestorage.app",
  messagingSenderId: "1026606002422",
  appId: "1:1026606002422:web:74e1091810cae03edbbcd7",
  measurementId: "G-4P59H2CNLZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize providers
const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

export { googleProvider, facebookProvider };
export default app;
