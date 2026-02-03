import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import RentalHistoryPage from "./pages/RentalHistoryPage";
import VehicleDetailsPage from "./pages/VehicleDetailsPage";
import {SignInPage} from "./pages/login/SignInPage";
import {SignUpPage} from "./pages/login/SignUpPage";
import {BookingPage1} from "./pages/BookingPage1";      
import CustomerVehicleListPage from "./pages/CustomerVehicleListPage";
import {Homepage} from "./pages/Homepage";
import ContactPage from "./pages/ContactPage";
import {ForgotPasswordPage} from "./pages/login/forgotpassword/ForgotPasswordPage";
import {VerifyCodePage} from "./pages/login/forgotpassword/VerifyCodePage";
import {ResetPasswordPage} from "./pages/login/forgotpassword/ResetPasswordPage";
import CustomerReviews from "./pages/CustomerRating";
import AdminBooking from "./pages/admin/AdminBooking.jsx";
import VehicleManagement from "./pages/admin/VehicleManagement.jsx";
import BookingHistory from "./pages/BookingHistory.jsx";
import AddVehicle from "./pages/AddVehicle.jsx";
import MyReviews from "./pages/MyReviews";
import OwnerBookingRequests from "./pages/owner/OwnerBookingRequest.jsx";

class AppErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("App error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "600px", margin: "2rem auto" }}>
          <h1 style={{ color: "#1e40af" }}>Something went wrong</h1>
          <p style={{ color: "#374151", marginBottom: "1rem" }}>
            The app encountered an error. Try refreshing the page or going back to the home page.
          </p>
          <pre style={{ background: "#f3f4f6", padding: "1rem", borderRadius: "8px", overflow: "auto", fontSize: "12px" }}>
            {this.state.error?.message ?? "Unknown error"}
          </pre>
          <a href="/" style={{ color: "#1e40af", textDecoration: "underline" }}>Go to home page</a>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <AppErrorBoundary>
      <Router>
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
        
        {/* owner */}
        <Route path="/rental-history" element={<RentalHistoryPage />} />
        <Route path="/add-vehicle" element={<AddVehicle />} />
        <Route path="/owner/booking-requests" element={<OwnerBookingRequests />} />

  
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
        <Route path="/booking-history" element={<BookingHistory />} />
        <Route path="/my-reviews" element={<MyReviews />} />



        {/* admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/booking" element={<AdminBooking/>} />
        <Route path="/admin/vehicles" element={<VehicleManagement />} />

        {/* login */}
        <Route path="/login" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-code" element={<VerifyCodePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        </Routes>
      </Router>
    </AppErrorBoundary>
  );
}

export default App;