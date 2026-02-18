import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// --- Layout Import ---
// This handles the Header and Footer for all main pages
import Layout from "./layouts/Layout"; 

// --- Page Imports ---
// Public & General
import { Homepage } from "./pages/Homepage";
import ContactPage from "./pages/ContactPage";
import { CustomerVehicleListPage } from "./pages/CustomerVehicleListPage";
import VehicleDetailsPage from "./pages/VehicleDetailsPage";
import CustomerReviews from "./pages/CustomerRating";

// Auth / Login / Signup
import { SignInPage } from "./pages/login/SignInPage";
import { SignUpPage } from "./pages/login/SignupPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import { ForgotPasswordPage } from "./pages/login/forgotpassword/ForgotPasswordPage";
import { VerifyCodePage } from "./pages/login/forgotpassword/VerifyCodePage";
import { ResetPasswordPage } from "./pages/login/forgotpassword/ResetPasswordPage";

// Booking & Rentals
import { RentVehiclePage } from "./pages/RentVehiclePage";
import { BookingPage1 } from "./pages/BookingPage1";
import BookingHistory from "./pages/BookingHistory";
import RentalHistoryPage from "./pages/RentalHistoryPage";

// Owner Pages
import MyVehicleOwner from "./pages/MyVehicleOwner";
import AddVehicle from "./pages/AddVehicle";
import MyReviews from "./pages/MyReviews";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBooking from "./pages/admin/AdminBooking";
import AdminReport from "./pages/admin/AdminReport";
import VehicleManagement from "./pages/admin/VehicleManagement";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import OwnerManagement from './pages/OwnerManagement'; 
import CustomerManagement from './pages/CustomerManagement';

// Profiles
import { OwnerProfileEdit } from "./pages/profilePages/OwnerProfileEdit";
import { AdminProfileEdit } from "./pages/profilePages/AdminProfileEdit";
import { CustomerProfileEdit } from "./pages/profilePages/CustomerProfileEdit";

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        
        {/* --- GROUP 1: Pages WITH Header & Footer (Wrapped in Layout) --- */}
        {/* The Layout component MUST contain <Outlet /> for these to work */}
        <Route element={<Layout />}>
            
            {/* Public Routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/contact" element={<ContactPage/>} />
            <Route path="/vehicles" element={<CustomerVehicleListPage />} />
            <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
            <Route path="/rent-vehicle" element={<RentVehiclePage />} />
            <Route path="/customer-reviews" element={<CustomerReviews />} />
            
            {/* Owner Routes */}
            <Route path="/rental-history" element={<RentalHistoryPage />} />
            <Route path="/owner/vehicles" element={<MyVehicleOwner />} />
            <Route path="/owner/vehicles/new" element={<AddVehicle />} />
            <Route path="/add-vehicle" element={<AddVehicle />} />
            <Route path="/booking-history" element={<BookingHistory />} />
            <Route path="/my-reviews" element={<MyReviews />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/booking" element={<AdminBooking />} />
            <Route path="/admin/report" element={<AdminReport />} />
            <Route path="/admin/vehicles" element={<VehicleManagement />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/owners" element={<OwnerManagement />} />
            <Route path="/admin/customers" element={<CustomerManagement />} />
            
            {/* Customer Routes */}
            <Route path="/booking" element={<BookingPage1 />} />

            {/* Profile Pages */}
            <Route path="/owner-profile" element={<OwnerProfileEdit/>} />
            <Route path="/admin-profile" element={<AdminProfileEdit/>} /> 
            <Route path="/customer-profile" element={<CustomerProfileEdit/>} /> 
        </Route>

        {/* --- GROUP 2: Pages WITHOUT Header/Footer (Login, Signup) --- */}
        {/* These stand alone and do not use the Layout */}
        <Route path="/login" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-code" element={<VerifyCodePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

      </Routes>
    </Router>
  );
}

export default App;