import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@material-tailwind/react";
import { Navbar } from "@/widgets/layout";
import { userRoutes } from "@/routes";
import { Home } from "./pages/home";
import QRScanner from "./components/QRScanner";
import PreorderPage from "./pages/preorderpage";
import { CafeList } from "./pages/CafeList";
import { SlotBooking } from "./pages/SlotBooking";
import { SignIn } from './pages/sign-in';
import { SignUp } from './pages/sign-up';
import PreorderModal from './pages/preorderModal';
import Cart from "./pages/cart";
import { ChatBot } from './components/ChatBot';
import ProtectedRoute from './components/ProtectedRoute';
import { AdminLogin } from "./pages/admin-login";
import { AdminPortal } from "./pages/admin-portal";
import { Profile } from "./pages/Profile";

function App() {
  const { pathname } = useLocation();

  // Add profile path to the list of routes where navbar should be hidden
  const hideNavbarPaths = [
    '/sign-in',
    '/sign-up',
    '/admin-login',
    '/admin-portal',
    '/profile',
    '/Profile'  // Add both cases to be safe
  ];

  return (
    <ThemeProvider>
      {!hideNavbarPaths.includes(pathname.toLowerCase()) && (  // Convert pathname to lowercase
        <div className="container absolute left-2/4 z-10 mx-auto -translate-x-2/4 p-4">
          <Navbar routes={userRoutes} />
        </div>
      )}
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/qr-scanner" element={<QRScanner />} />
        <Route path="/preorderpage" element={<PreorderPage />} />
        <Route path="/preorderModal" element={<PreorderModal />} />
        <Route path="/cafes" element={<CafeList />} />
        <Route path="/book-slot/:cafeId" element={<SlotBooking />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-portal" element={<AdminPortal />} />
      </Routes>
      <ChatBot />
    </ThemeProvider>
  );
}

export default App;
