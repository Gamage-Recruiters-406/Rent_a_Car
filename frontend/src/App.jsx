import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// --- Page Imports ---
import VerifyEmailPage from "./pages/VerifyEmailPage";
import VehicleDetailsPage from "./pages/VehicleDetailsPage";
import { SignInPage } from "./pages/login/SignInPage";
import { SignUpPage } from "./pages/login/SignupPage";
import { CustomerVehicleListPage } from "./pages/CustomerVehicleListPage";
import { RentVehiclePage } from "./pages/RentVehiclePage";
import ContactPage from "./pages/ContactPage";
import { ForgotPasswordPage } from "./pages/login/forgotpassword/ForgotPasswordPage";
import { VerifyCodePage } from "./pages/login/forgotpassword/VerifyCodePage";
import { ResetPasswordPage } from "./pages/login/forgotpassword/ResetPasswordPage";

import { OwnerProfileEdit } from "./pages/profilePages/OwnerProfileEdit";
import { AdminProfileEdit } from "./pages/profilePages/AdminProfileEdit";
import { CustomerProfileEdit } from "./pages/profilePages/CustomerProfileEdit";

import CustomerReviews from "./pages/CustomerRating";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBooking from "./pages/admin/AdminBooking.jsx";
import AddVehicle from "./pages/AddVehicle.jsx";
import MyVehicleOwner from "./pages/MyVehicleOwner.jsx";

import BookingHistory from "./pages/BookingHistory.jsx";
import MyReviews from "./pages/MyReviews";
import RentalHistoryPage from "./pages/RentalHistoryPage";
import { BookingPage1 } from "./pages/BookingPage1";
import { Homepage } from "./pages/Homepage";
import AdminReport from "./pages/admin/AdminReport";
import VehicleManagement from "./pages/admin/VehicleManagement";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage.jsx";

// --- Owner Management Import ---
import OwnerManagement from './pages/OwnerManagement'; 

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        
        {/* --- 1. NEW ADMIN OWNER MANAGEMENT ROUTE --- */}
        <Route path="/admin/owners" element={<OwnerManagement />} />

        {/* Public Routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/dashboard" element={<h1>Dashboard</h1>} />
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
        <Route path="/owner-profile" element={<OwnerProfileEdit/>} />

        {/* Admin Routes */}
        <Route path="/admin/booking" element={<AdminBooking />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/report" element={<AdminReport />} />
        <Route path="/admin/vehicles" element={<VehicleManagement />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="/admin-profile" element={<AdminProfileEdit/>} /> 
        
        {/* Auth Routes */}
        <Route path="/login" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-code" element={<VerifyCodePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Customer Routes */}
        <Route path="/customer-profile" element={<CustomerProfileEdit/>} />   
        <Route path="/booking" element={<BookingPage1 />} />

      </Routes>
    </Router>
  );
}

export default App;