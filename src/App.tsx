import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NewInvoice from "./pages/NewInvoice";
import InvoiceView from "./pages/InvoiceView";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Navbar is hidden on print via CSS */}
        <div className="no-print">
          <Navbar />
        </div>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/invoices/new" element={<PrivateRoute><NewInvoice /></PrivateRoute>} />
          <Route path="/invoices/:id" element={<PrivateRoute><InvoiceView /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
