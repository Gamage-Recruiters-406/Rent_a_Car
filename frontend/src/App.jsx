import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import OwnerBookingRequest from "./pages/owner/OwnerBookingRequest";
import "./App.css";
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/verify-email" element={<VerifyEmailPage/>} />
        <Route path="/owner/booking-requests" element={<OwnerBookingRequest/>} />
      </Routes>
    </Router>
  )
}

export default App
