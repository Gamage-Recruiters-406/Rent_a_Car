import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import RentalHistoryPage from "./pages/RentalHistoryPage";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/rental-history" element={<RentalHistoryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
