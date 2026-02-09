import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// --- Page Imports ---
import VerifyEmailPage from "./pages/VerifyEmailPage";
import VehicleDetailsPage from "./pages/VehicleDetailsPage";
import { SignInPage } from "./pages/login/SignInPage";
import { SignUpPage } from "./pages/login/SignupPage";
import { CustomerVehicleListPage } from "./pages/CustomerVehicleListPage";

// --- New Import ---
import OwnerManagement from './pages/OwnerManagement';

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<CustomerVehicleListPage />} />
        <Route path="/vehicles" element={<CustomerVehicleListPage />} />
        <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
        <Route path="/dashboard" element={<h1>Dashboard</h1>} />

        {/* Authentication Routes */}
        <Route path="/login" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* --- Admin / Owner Routes --- */}
        <Route path="/admin/owners" element={<OwnerManagement />} />
      </Routes>
    </Router>
  );
}

export default App;