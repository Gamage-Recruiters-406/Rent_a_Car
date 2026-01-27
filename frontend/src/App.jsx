import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import { SignInPage } from "./pages/login/SignInPage";
import{SignUpPage} from "./pages/login/SignupPage";
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/signin" element={<SignInPage/>} />
        <Route path="/signup" element={<SignUpPage/>} />
        <Route path="/verify-email" element={<VerifyEmailPage/>} />
      </Routes>
    </Router>
  )
}

export default App
