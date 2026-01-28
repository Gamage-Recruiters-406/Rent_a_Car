import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import AdminBooking from "./pages/admin/AdminBooking";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/verify-email" element={<VerifyEmailPage/>} />
        <Route path="/admin/booking" element={<AdminBooking/>} />
      </Routes>
    </Router>
  )
}

export default App;

