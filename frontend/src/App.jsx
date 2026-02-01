import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import RentalHistoryPage from "./pages/RentalHistoryPage";
import VehicleDetailsPage from "./pages/VehicleDetailsPage";
import { SignInPage } from "./pages/login/SignInPage";
import { SignUpPage } from "./pages/login/SignUpPage";
import { BookingPage1 } from "./pages/BookingPage1";      
import { CustomerVehicleListPage } from "./pages/CustomerVehicleListPage";
import { Homepage } from "./pages/Homepage";
import ContactPage from "./pages/ContactPage";
import { ForgotPasswordPage } from "./pages/login/forgotpassword/ForgotPasswordPage";
import { VerifyCodePage } from "./pages/login/forgotpassword/VerifyCodePage";
import { ResetPasswordPage } from "./pages/login/forgotpassword/ResetPasswordPage";
import CustomerReviews from "./pages/CustomerRating";
import AdminBooking from "./pages/admin/AdminBooking.jsx";




function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        
        {/* owner */}
        <Route path="/rental-history" element={<RentalHistoryPage />} />
  
        {/* public */}
        <Route path="/dashboard" element={<h1>Dashboard</h1>} />
        <Route path="/contact" element={<ContactPage/>} />
        <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
        <Route path="/" element={<Homepage />} />


        {/* customer */}
        <Route path="/CustomerVehicleListPage" element={<CustomerVehicleListPage />} />
        <Route path="/customer-reviews" element={<CustomerReviews/>} />
        <Route path="/vehicles" element={<CustomerVehicleListPage />} />
        <Route path="/booking" element={<BookingPage1 />} />


        {/* admin */}
        <Route path="/admin/booking" element={<AdminBooking/>} />


        {/* login */}
        <Route path="/login" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-code" element={<VerifyCodePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

      </Routes>
    </Router>
  );
}

export default App;
