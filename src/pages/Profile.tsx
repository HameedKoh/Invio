import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getBrand, saveBrand, updateBrand } from "../services/firestore";
import { fileToLogoDataUrl } from "../utils/logo";
import type { UserBrand } from "../types";
import { User, Phone, Landmark, MapPin, Globe, Hash, FileText, Upload, Save } from "lucide-react";

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const [brand, setBrand] = useState<Partial<UserBrand>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  useEffect(() => {
    if (!currentUser) return;
    getBrand(currentUser.uid).then((b: UserBrand | null) => {
      if (b) {
        setBrand(b);
        if (b.logoUrl) setLogoPreview(b.logoUrl);
      }
      setLoading(false);
    });
  }, [currentUser]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    setError("");
    try {
      let logoUrl = brand.logoUrl || "";
      if (logoFile) logoUrl = await fileToLogoDataUrl(logoFile);
      const updatedBrand = { ...brand, logoUrl } as Omit<UserBrand, "uid" | "createdAt">;

      if (brand.uid) {
        await updateBrand(currentUser.uid, { ...updatedBrand });
      } else {
        await saveBrand(currentUser.uid, updatedBrand);
      }
      setBrand((prev: Partial<UserBrand>) => ({ ...prev, logoUrl }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error && err.message.includes("Logo") ? err.message : "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof UserBrand) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setBrand((prev: Partial<UserBrand>) => ({ ...prev, [k]: e.target.value }));

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      <span className="spinner spinner-dark" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  );

  return (
    <div className="page">
      <div className="container" style={{ padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "0.3rem" }}>Brand Profile</h1>
          <p style={{ color: "#7A6050", marginBottom: "2rem" }}>
            This information appears on every invoice you generate.
          </p>

          <form onSubmit={handleSave}>
            <div className="card" style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ marginBottom: "1.2rem", fontSize: "1rem", fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileText size={16} color="#6F4E37" /> Brand Identity
              </h3>

              {/* Logo */}
              <div className="field" style={{ alignItems: "center", marginBottom: "1.2rem" }}>
                <label className="label">Logo</label>
                <label style={styles.logoWrap}>
                  {logoPreview
                    ? <img src={logoPreview} alt="logo" style={styles.logoImg} />
                    : <><Upload size={20} color="#A08070" /><span style={{ fontSize: "0.78rem", color: "#A08070" }}>Upload logo</span></>
                  }
                  <input type="file" accept="image/*" hidden onChange={handleLogoChange} />
                </label>
              </div>

              <div className="grid-2">
                <div className="field">
                  <label className="label">Brand Name *</label>
                  <div style={styles.iw}>
                    <FileText size={14} style={styles.icon} />
                    <input type="text" className="inp" style={{ paddingLeft: "2.2rem" }}
                      value={brand.brandName || ""} onChange={set("brandName")} required placeholder="ACME Co." />
                  </div>
                </div>
                <div className="field">
                  <label className="label">Owner / Contact *</label>
                  <div style={styles.iw}>
                    <User size={14} style={styles.icon} />
                    <input type="text" className="inp" style={{ paddingLeft: "2.2rem" }}
                      value={brand.ownerName || ""} onChange={set("ownerName")} required placeholder="John Doe" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ marginBottom: "1.2rem", fontSize: "1rem", fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MapPin size={16} color="#6F4E37" /> Contact Information
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="field">
                  <label className="label">Phone *</label>
                  <div style={styles.iw}>
                    <Phone size={14} style={styles.icon} />
                    <input type="tel" className="inp" style={{ paddingLeft: "2.2rem" }}
                      value={brand.phone || ""} onChange={set("phone")} required placeholder="+1 555 000 0000" />
                  </div>
                </div>
                <div className="field">
                  <label className="label">Address *</label>
                  <div style={styles.iw}>
                    <MapPin size={14} style={styles.icon} />
                    <input type="text" className="inp" style={{ paddingLeft: "2.2rem" }}
                      value={brand.address || ""} onChange={set("address")} required placeholder="123 Main Street" />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label className="label">City *</label>
                    <input type="text" className="inp" value={brand.city || ""} onChange={set("city")} required placeholder="New York" />
                  </div>
                  <div className="field">
                    <label className="label">Country *</label>
                    <input type="text" className="inp" value={brand.country || ""} onChange={set("country")} required placeholder="United States" />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label className="label">Website</label>
                    <div style={styles.iw}>
                      <Globe size={14} style={styles.icon} />
                      <input type="url" className="inp" style={{ paddingLeft: "2.2rem" }}
                        value={brand.website || ""} onChange={set("website")} placeholder="https://brand.com" />
                    </div>
                  </div>
                  <div className="field">
                    <label className="label">Tax ID / VAT</label>
                    <div style={styles.iw}>
                      <Hash size={14} style={styles.icon} />
                      <input type="text" className="inp" style={{ paddingLeft: "2.2rem" }}
                        value={brand.taxId || ""} onChange={set("taxId")} placeholder="XX-1234567" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ marginBottom: "1.2rem", fontSize: "1rem", fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Landmark size={16} color="#6F4E37" /> Bank Details
              </h3>
              <p style={{ fontSize: "0.82rem", color: "#7A6050", marginBottom: "1rem" }}>Shown on your invoices so clients know where to pay.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="grid-2">
                  <div className="field">
                    <label className="label">Bank Name</label>
                    <input type="text" className="inp" value={brand.bankName || ""} onChange={set("bankName")} placeholder="GTBank" />
                  </div>
                  <div className="field">
                    <label className="label">Account Number</label>
                    <input type="text" inputMode="numeric" className="inp" value={brand.accountNumber || ""} onChange={set("accountNumber")} placeholder="0123456789" />
                  </div>
                </div>
                <div className="field">
                  <label className="label">Account Name</label>
                  <input type="text" className="inp" value={brand.accountName || ""} onChange={set("accountName")} placeholder="BlvckMotion Studio" />
                </div>
              </div>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}
            {success && <div style={styles.successBox}>✓ Profile saved successfully!</div>}

            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} />
              {saving ? <span className="spinner" /> : "Save Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  iw: { position: "relative", display: "flex", alignItems: "center" },
  icon: { position: "absolute", left: "0.7rem", color: "#A08070", pointerEvents: "none" },
  logoWrap: { width: 90, height: 90, borderRadius: "10px", border: "2px dashed #D9CFC4", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.3rem", cursor: "pointer", background: "#FAF8F5", overflow: "hidden" },
  logoImg: { width: "100%", height: "100%", objectFit: "cover" },
  errorBox: { background: "#FFEBEE", border: "1px solid #FFCDD2", color: "#C62828", borderRadius: "8px", padding: "0.7rem 1rem", fontSize: "0.85rem", marginBottom: "1rem" },
  successBox: { background: "#E8F5E9", border: "1px solid #C8E6C9", color: "#2E7D32", borderRadius: "8px", padding: "0.7rem 1rem", fontSize: "0.85rem", marginBottom: "1rem" },
};

export default Profile;
