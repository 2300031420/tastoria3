import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CafeMenu from "./CafeMenu";
import QRScanner from "./QRScanner";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/cafe/:cafeId" element={<CafeMenu />} />
        <Route path="/scan" element={<QRScanner />} />
      </Routes>
    </Router>
  );
}

export default App;
