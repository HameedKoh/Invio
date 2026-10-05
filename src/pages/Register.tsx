import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { saveBrand } from "../services/firestore";
import { fileToLogoDataUrl } from "../utils/logo";
import { FileText, Mail, Lock, User, Phone, MapPin, Globe, Hash, Eye, EyeOff, Upload } from "lucide-react";

const Register: React.FC = () => {
  const { signup, currentUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  // Step 1 — auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // Step 2 — brand info
  const [brandName, setBrandName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [taxId, setTaxId] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError("");
    setLoading(true);
    try {
      await signup(email, password);
      setStep(2);
    } catch (err: any) {
      const msg = err?.code === "auth/email-already-in-use"
        ? "Email already in use."
        : "Registration failed. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setError("");
    setLoading(true);
    try {
      let logoUrl = "";
      if (logoFile) logoUrl = await fileToLogoDataUrl(logoFile);

      await saveBrand(currentUser.uid, {
        brandName,
        ownerName,
        email: currentUser.email!,
        phone,
        address,
        city,
        country,
        website,
        taxId,
        logoUrl,
        bankName,
        accountName,
        accountNumber,
      });
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error && err.message.includes("Logo") ? err.message : "Failed to save brand info. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="card">
        {/* Logo */}
        <div style={styles.logo}>
          <FileText size={26} color="#6F4E37" strokeWidth={2.5} />
          <span style={styles.logoText}>INVIO</span>
        </div>

        {/* Step indicator */}
        <div style={styles.steps}>
          <div style={{ ...styles.step, ...(step >= 1 ? styles.stepActive : {}) }}>1</div>
          <div style={styles.stepLine} />
          <div style={{ ...styles.step, ...(step >= 2 ? styles.stepActive : {}) }}>2</div>
        </div>
        <h2 style={styles.title}>{step === 1 ? "Create Account" : "Brand Information"}</h2>
        <p style={styles.sub}>
          {step === 1 ? "Set up your INVIO credentials" : "Tell us about your brand"}
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleStep1} style={styles.form}>
            <div className="field">
              <label className="label">Email</label>
              <div style={styles.iw}>
                <Mail size={15} style={styles.icon} />
                <input type="email" className="inp" style={{ paddingLeft: "2.3rem" }}
                  placeholder="you@brand.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="field">
              <label className="label">Password</label>
              <div style={styles.iw}>
                <Lock size={15} style={styles.icon} />
                <input type={showPwd ? "text" : "password"} className="inp"
                  style={{ paddingLeft: "2.3rem", paddingRight: "2.8rem" }}
                  placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" style={styles.eyeBtn} onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="field">
              <label className="label">Confirm Password</label>
              <div style={styles.iw}>
                <Lock size={15} style={styles.icon} />
                <input type={showPwd ? "text" : "password"} className="inp"
                  style={{ paddingLeft: "2.3rem" }}
                  placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
              {loading ? <span className="spinner" /> : "Continue →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2} style={styles.form}>
            {/* Logo upload */}
            <div className="field" style={{ alignItems: "center" }}>
              <label className="label">Brand Logo</label>
              <label style={styles.logoUpload}>
                {logoPreview
                  ? <img src={logoPreview} alt="logo" style={styles.logoImg} />
                  : <><Upload size={22} color="#A08070" /><span style={{ fontSize: "0.8rem", color: "#A08070" }}>Click to upload</span></>
                }
                <input type="file" accept="image/*" hidden onChange={handleLogoChange} />
              </label>
            </div>

            <div className="grid-2">
              <div className="field">
                <label className="label">Brand Name *</label>
                <div style={styles.iw}>
                  <FileText size={15} style={styles.icon} />
                  <input type="text" className="inp" style={{ paddingLeft: "2.3rem" }}
                    placeholder="ACME Co." value={brandName} onChange={e => setBrandName(e.target.value)} required />
                </div>
              </div>
              <div className="field">
                <label className="label">Owner / Contact Name *</label>
                <div style={styles.iw}>
                  <User size={15} style={styles.icon} />
                  <input type="text" className="inp" style={{ paddingLeft: "2.3rem" }}
                    placeholder="John Doe" value={ownerName} onChange={e => setOwnerName(e.target.value)} required />
                </div>
              </div>
            </div>

            <div className="field">
              <label className="label">Phone *</label>
              <div style={styles.iw}>
                <Phone size={15} style={styles.icon} />
                <input type="tel" className="inp" style={{ paddingLeft: "2.3rem" }}
                  placeholder="+1 555 000 0000" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
            </div>

            <div className="field">
              <label className="label">Address *</label>
              <div style={styles.iw}>
                <MapPin size={15} style={styles.icon} />
                <input type="text" className="inp" style={{ paddingLeft: "2.3rem" }}
                  placeholder="123 Main Street" value={address} onChange={e => setAddress(e.target.value)} required />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label className="label">City *</label>
                <input type="text" className="inp" placeholder="New York" value={city}
                  onChange={e => setCity(e.target.value)} required />
              </div>
              <div className="field">
                <label className="label">Country *</label>
                <input type="text" className="inp" placeholder="United States" value={country}
                  onChange={e => setCountry(e.target.value)} required />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label className="label">Website</label>
                <div style={styles.iw}>
                  <Globe size={15} style={styles.icon} />
                  <input type="url" className="inp" style={{ paddingLeft: "2.3rem" }}
                    placeholder="https://brand.com" value={website} onChange={e => setWebsite(e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label className="label">Tax ID / VAT</label>
                <div style={styles.iw}>
                  <Hash size={15} style={styles.icon} />
                  <input type="text" className="inp" style={{ paddingLeft: "2.3rem" }}
                    placeholder="XX-1234567" value={taxId} onChange={e => setTaxId(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label className="label">Bank Name</label>
                <input type="text" className="inp" placeholder="GTBank" value={bankName} onChange={e => setBankName(e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Account Number</label>
                <input type="text" inputMode="numeric" className="inp" placeholder="0123456789" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label className="label">Account Name</label>
              <input type="text" className="inp" placeholder="Name on the account" value={accountName} onChange={e => setAccountName(e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
              {loading ? <span className="spinner" /> : "Complete Setup →"}
            </button>
          </form>
        )}

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#6F4E37", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--off-white)", padding: "2rem" },
  card: { width: "100%", maxWidth: "520px", textAlign: "center" },
  logo: { display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" },
  logoText: { fontFamily: "'Playfair Display', serif", fontSize: "1.7rem", fontWeight: 700, color: "#6F4E37" },
  steps: { display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" },
  step: { width: 28, height: 28, borderRadius: "50%", border: "2px solid #D9CFC4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: "#A08070", background: "#FAF8F5" },
  stepActive: { borderColor: "#6F4E37", background: "#6F4E37", color: "#fff" },
  stepLine: { flex: 1, maxWidth: 40, height: 2, background: "#D9CFC4" },
  title: { fontSize: "1.45rem", marginBottom: "0.3rem", color: "#2C1A0E" },
  sub: { color: "#7A6050", fontSize: "0.88rem", marginBottom: "1.5rem" },
  form: { display: "flex", flexDirection: "column", gap: "1rem", textAlign: "left" },
  iw: { position: "relative", display: "flex", alignItems: "center" },
  icon: { position: "absolute", left: "0.75rem", color: "#A08070", pointerEvents: "none" },
  eyeBtn: { position: "absolute", right: "0.75rem", background: "none", border: "none", cursor: "pointer", color: "#A08070", padding: 0, display: "flex" },
  errorBox: { background: "#FFEBEE", border: "1px solid #FFCDD2", color: "#C62828", borderRadius: "8px", padding: "0.7rem 1rem", fontSize: "0.85rem", marginBottom: "1rem" },
  footer: { marginTop: "1.2rem", fontSize: "0.875rem", color: "#7A6050" },
  logoUpload: { width: 100, height: 100, borderRadius: "12px", border: "2px dashed #D9CFC4", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.4rem", cursor: "pointer", background: "#FAF8F5", overflow: "hidden" },
  logoImg: { width: "100%", height: "100%", objectFit: "cover" },
};

export default Register;
