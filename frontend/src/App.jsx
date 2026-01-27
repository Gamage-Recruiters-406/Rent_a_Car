import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import CustomerReviews from "./pages/CustomerRating";
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/verify-email" element={<VerifyEmailPage/>} />
        <Route path="/customer-reviews" element={<CustomerReviews/>} />
      </Routes>
    </Router>
  )
}

export default App
