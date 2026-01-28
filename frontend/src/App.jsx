import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import VerifyEmailPage from "./pages/VerifyEmailPage";
import { SignInPage } from "./pages/login/SignInPage";
import{SignUpPage} from "./pages/login/SignupPage";
import { CustomerVehicleListPage } from "./pages/CustomerVehicleListPage";

function App() {

  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<CustomerVehicleListPage />} />
        <Route path="/vehicles" element={<CustomerVehicleListPage />} />
        <Route path="/dashboard" element={<h1>Dashboard</h1>} />




        {/* login */}
        <Route path="/login" element={<SignInPage/>} />
        <Route path="/signup" element={<SignUpPage/>} />
        <Route path="/verify-email" element={<VerifyEmailPage/>} />
      </Routes>
    </Router>
  )
}

export default App
