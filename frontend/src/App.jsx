import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import VerifyEmailPage from "./pages/VerifyEmailPage";
import { SignInPage } from "./pages/login/SignInPage";
import{SignUpPage} from "./pages/login/SignupPage";
import { ForgotPasswordPage } from "./pages/login/forgotpassword/ForgotPasswordPage";
import { VerifyCodePage } from "./pages/login/forgotpassword/VerifyCodePage";
import { ResetPasswordPage } from "./pages/login/forgotpassword/ResetPasswordPage";
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

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-code" element={<VerifyCodePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </Router>
  )
}

export default App
