import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, FileText, User, PlusCircle, LayoutDashboard } from "lucide-react";

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand-logo">
          <FileText size={22} strokeWidth={2.5} />
          INVIO
          <span className="brand-dot" />
        </Link>

        {currentUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Link to="/dashboard" className="btn btn-ghost" style={{ padding: "0.45rem 0.9rem" }}>
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <Link to="/invoices/new" className="btn btn-primary" style={{ padding: "0.45rem 0.9rem" }}>
              <PlusCircle size={16} />
              New Invoice
            </Link>
            <Link to="/profile" className="btn btn-ghost" style={{ padding: "0.45rem 0.9rem" }}>
              <User size={16} />
            </Link>
            <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: "0.45rem 0.9rem" }}>
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link to="/login" className="btn btn-outline">Log In</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
