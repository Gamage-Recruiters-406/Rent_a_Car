import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import VerifyEmailPage from "./pages/VerifyEmailPage";
function App() {

  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/dashboard" element={<h1>Dashboard</h1>} />




        {/* login */}
        <Route path="/login" element={<SignInPage/>} />
        <Route path="/signup" element={<SignUpPage/>} />
        <Route path="/verify-email" element={<VerifyEmailPage/>} />
        <Route path="/owner/booking-requests" element={<OwnerBookingRequest/>} />
      </Routes>
    </Router>
  )
}

export default App
