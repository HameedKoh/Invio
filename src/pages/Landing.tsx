import React from "react";
import { Link } from "react-router-dom";
import { FileText, Shield, Zap, Archive } from "lucide-react";

const Landing: React.FC = () => {
  return (
    <div style={{ minHeight: "100vh", background: "var(--off-white)" }}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.badge}>Professional Invoicing</div>
        <h1 style={styles.heroTitle}>
          Create Beautiful<br />
          <span style={{ color: "#6F4E37" }}>Invoices in Minutes</span>
        </h1>
        <p style={styles.heroSub}>
          INVIO gives freelancers and small businesses an elegant, simple way
          to create, track, and print professional invoices — all stored securely in the cloud.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: "0.85rem 2rem", fontSize: "1rem" }}>
            Get Started — Free
          </Link>
          <Link to="/login" className="btn btn-outline" style={{ padding: "0.85rem 2rem", fontSize: "1rem" }}>
            Sign In
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="container" style={{ padding: "4rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "2rem", color: "#2C1A0E" }}>Everything you need</h2>
          <p style={{ color: "#7A6050", marginTop: "0.5rem" }}>Designed for professionals who value their time</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "1.5rem" }}>
          <FeatureCard icon={<FileText size={26} color="#6F4E37" />} title="Smart Invoices" desc="Auto-generated unique invoice numbers, professional layout with your brand logo and colors." />
          <FeatureCard icon={<Shield size={26} color="#6F4E37" />} title="Secure Auth" desc="Your data is protected with Firebase Authentication and Firestore security rules." />
          <FeatureCard icon={<Zap size={26} color="#6F4E37" />} title="Instant Print" desc="One-click printing with auto-save to database. Every printed invoice is tracked." />
          <FeatureCard icon={<Archive size={26} color="#6F4E37" />} title="Invoice History" desc="All your invoices stored securely. Access, view, and reprint from anywhere." />
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "center" }}>
          <FileText size={16} color="#C9A882" />
          <span style={{ fontFamily: "'Playfair Display', serif", color: "#C9A882", fontWeight: 700 }}>INVIO</span>
        </div>
        <p style={{ color: "#7A6050", fontSize: "0.8rem", marginTop: "0.5rem" }}>Professional invoicing for modern businesses.</p>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="card" style={{ textAlign: "center", padding: "2rem 1.5rem" }}>
    <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
      <div style={{ background: "var(--off-white-dark)", borderRadius: "50%", padding: "0.9rem", display: "flex" }}>{icon}</div>
    </div>
    <h3 style={{ fontSize: "1.05rem", marginBottom: "0.5rem", color: "#2C1A0E" }}>{title}</h3>
    <p style={{ color: "#7A6050", fontSize: "0.88rem", lineHeight: 1.6 }}>{desc}</p>
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  hero: { textAlign: "center", padding: "5rem 1.5rem 3rem", background: "linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)" },
  badge: { display: "inline-block", background: "#F0EBE3", color: "#6F4E37", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.35rem 0.9rem", borderRadius: "50px", marginBottom: "1.5rem" },
  heroTitle: { fontSize: "clamp(2.2rem, 5vw, 3.5rem)", lineHeight: 1.2, color: "#2C1A0E", marginBottom: "1.2rem", fontFamily: "'Playfair Display', serif" },
  heroSub: { maxWidth: 520, margin: "0 auto 2rem", color: "#7A6050", fontSize: "1rem", lineHeight: 1.7 },
  footer: { textAlign: "center", padding: "2rem", borderTop: "1px solid var(--border)" },
};

export default Landing;
