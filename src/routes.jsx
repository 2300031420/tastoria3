import { Home, SignIn, SignUp } from "@/pages";
import { SlotBooking } from "@/pages/SlotBooking";
import { CafeList } from "@/pages/CafeList";
import { element } from "prop-types";
import PreorderModal from './pages/preorderModal';
import PreorderPage from './pages/preorderpage';
import QRScanner from './components/QRScanner';

export const routes = [
  {
    name: "home",
    path: "/home",
    element: <Home />,
  },
  {
    name: "Slot-booking",
    path: "/cafes",
    element: <CafeList />,
  },
  {
    name: "pre-order",
    path: "/preorder",
    element: <PreorderModal />,
    style: { color: "#2196F3" }
  },
  
  {
    name: "Qr-scan",
    path: "/scan",
    element: <QRScanner />,
  },
  
   
  {
    path: '/preorder',
    element: <PreorderModal />,
  },
  {
    path: '/preorder/:restaurantId',
    element: <PreorderPage />,
  },
];

export default routes;
