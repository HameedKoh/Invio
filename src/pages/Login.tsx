import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FileText, Mail, Lock, Eye, EyeOff } from "lucide-react";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err?.code === "auth/invalid-credential"
        ? "Invalid email or password."
        : "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="card">
        {/* Logo */}
        <div style={styles.logo}>
          <FileText size={28} color="#6F4E37" strokeWidth={2.5} />
          <span style={styles.logoText}>INVIO</span>
        </div>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.sub}>Sign in to manage your invoices</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="field">
            <label className="label">Email</label>
            <div style={styles.inputWrap}>
              <Mail size={16} style={styles.inputIcon} />
              <input
                type="email"
                className="inp"
                style={{ paddingLeft: "2.4rem" }}
                placeholder="you@brand.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Password</label>
            <div style={styles.inputWrap}>
              <Lock size={16} style={styles.inputIcon} />
              <input
                type={showPwd ? "text" : "password"}
                className="inp"
                style={{ paddingLeft: "2.4rem", paddingRight: "2.8rem" }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                style={styles.eyeBtn}
                onClick={() => setShowPwd(!showPwd)}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? <span className="spinner" /> : "Sign In"}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#6F4E37", fontWeight: 600 }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--off-white)",
    padding: "2rem",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    marginBottom: "1.2rem",
  },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.8rem",
    fontWeight: 700,
    color: "#6F4E37",
  },
  title: {
    fontSize: "1.5rem",
    marginBottom: "0.3rem",
    color: "#2C1A0E",
  },
  sub: {
    color: "#7A6050",
    fontSize: "0.9rem",
    marginBottom: "1.8rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    textAlign: "left",
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "0.8rem",
    color: "#A08070",
    pointerEvents: "none",
  },
  eyeBtn: {
    position: "absolute",
    right: "0.8rem",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#A08070",
    padding: 0,
    display: "flex",
  },
  errorBox: {
    background: "#FFEBEE",
    border: "1px solid #FFCDD2",
    color: "#C62828",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    fontSize: "0.87rem",
    marginBottom: "1rem",
  },
  footer: {
    marginTop: "1.5rem",
    fontSize: "0.875rem",
    color: "#7A6050",
  },
};

export default Login;
