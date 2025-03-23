import { Home } from "@/pages/home";
import { Profile } from "./pages/Profile";
import { SlotBooking } from "@/pages/SlotBooking";
import { CafeList } from "@/pages/CafeList";
import PreorderModal from './pages/preorderModal';
import PreorderPage from "@/pages/preorderpage";
import QRScanner from "@/components/QRScanner";
import { AdminLogin } from "./pages/admin-login";
import { AdminPortal } from "./pages/admin-portal";
import { MenuManagement } from "./pages/admin/MenuManagement";

// Regular user routes
export const userRoutes = [
  {
    name: "Home",
    path: "/home",
    element: <Home />,
  },
  {
    name: "Book Table",
    path: "/cafes",
    element: <CafeList />,
  },
  {
    name: "QR Scanner",
    path: "/qr-scanner",
    element: <QRScanner />,
  },
  {
    name: "Pre-order",
    path: "/preorderModal",
    element: <PreorderModal />,
  },
  {
    name: "profile",
    path: "/profile",
    element: <Profile />,
  },
];

// Admin routes (these won't show in the navigation)
export const adminRoutes = [
  {
    path: "/admin-login",
    element: <AdminLogin />,
  },
  {
    path: "/admin-portal",
    element: <AdminPortal />,
  },
];

// Combine all routes for the router
export const routes = [...userRoutes, ...adminRoutes, {
  path: "/admin/menu",
  element: <MenuManagement />,
}];

export default routes;