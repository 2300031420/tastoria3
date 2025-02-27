import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Navbar } from "@/widgets/layout";
import routes from "@/routes";
import { SignIn } from './pages/sign-in';
import { SignUp } from './pages/sign-up';
import PreorderPage from './pages/preorderpage';
import Cart from "./pages/cart";
import { CafeList } from "./pages/CafeList";
import { SlotBooking } from "./pages/SlotBooking";
import { ChatBot } from './components/ChatBot';
import ProtectedRoute from './components/ProtectedRoute';



function App() {
  const { pathname } = useLocation();

  return (
    <>
      {!(pathname == '/sign-in' || pathname == '/sign-up') && (
        <div className="container absolute left-2/4 z-10 mx-auto -translate-x-2/4 p-4">
          <Navbar routes={routes} />
        </div>
      )
      }
      <Routes>
        {routes.map(
          ({ path, element }, key) =>
            element && <Route key={key} exact path={path} element={element} />
        )}
      
        <Route path="*" element={<Navigate to="/home" replace />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route 
          path="/preorder" 
          element={
            <ProtectedRoute>
              <PreorderPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/cart" element={<Cart />} />
        <Route path="/cafes" element={<CafeList />} />
        <Route path="/book-slot/:cafeId" element={<SlotBooking />} />
        
      </Routes>
      <ChatBot />
    </>
  );
}

export default App;
