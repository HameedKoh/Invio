import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserInvoices, getBrand } from "../services/firestore";
import type { Invoice, UserBrand } from "../types";
import { formatMoney } from "../utils/money";
import { PlusCircle, FileText, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [brand, setBrand] = useState<UserBrand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      getUserInvoices(currentUser.uid),
      getBrand(currentUser.uid),
    ])
      .then(([invs, br]) => {
        setInvoices(invs);
        setBrand(br);
      })
      .catch((err) => {
        console.error("Dashboard load failed:", err);
        setError("Could not load your invoices. Check your connection and Firestore rules.");
      })
      .finally(() => setLoading(false));
  }, [currentUser]);

  // Never add different currencies together: total per currency, Naira first.
  const totalsByCurrency = invoices.reduce<Record<string, number>>((m, i) => {
    const c = i.currency || "NGN";
    m[c] = (m[c] || 0) + i.total;
    return m;
  }, {});
  const totalLines = Object.entries(totalsByCurrency)
    .sort(([a], [b]) => (a === "NGN" ? -1 : b === "NGN" ? 1 : a.localeCompare(b)))
    .map(([c, v]) => formatMoney(v, c));
  if (totalLines.length === 0) totalLines.push(formatMoney(0, "NGN"));
  const printed = invoices.filter(i => i.status === "printed").length;
  const drafts = invoices.filter(i => i.status === "draft").length;

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <span className="spinner spinner-dark" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ padding: "2rem 1.5rem" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", color: "#2C1A0E", marginBottom: "0.2rem" }}>
              {brand ? `Welcome, ${brand.brandName}` : "Dashboard"}
            </h1>
            <p style={{ color: "#7A6050", fontSize: "0.9rem" }}>Manage and track your invoices</p>
          </div>
          <Link to="/invoices/new" className="btn btn-primary">
            <PlusCircle size={18} /> Create Invoice
          </Link>
        </div>

        {error && (
          <div style={{ background: "#FFEBEE", border: "1px solid #FFCDD2", color: "#C62828", borderRadius: 8, padding: "0.7rem 1rem", fontSize: "0.85rem", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <StatCard icon={<TrendingUp size={22} color="#6F4E37" />} label="Total Invoiced" value={<>{totalLines.map(l => <div key={l}>{l}</div>)}</>} />
          <StatCard icon={<FileText size={22} color="#6F4E37" />} label="Total Invoices" value={String(invoices.length)} />
          <StatCard icon={<CheckCircle2 size={22} color="#4CAF50" />} label="Printed" value={String(printed)} />
          <StatCard icon={<Clock size={22} color="#FF8F00" />} label="Drafts" value={String(drafts)} />
        </div>

        {/* Invoice List */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileText size={18} color="#6F4E37" />
            <h3 style={{ fontSize: "1rem", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>Recent Invoices</h3>
          </div>

          {invoices.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <FileText size={40} color="#D9CFC4" style={{ marginBottom: "1rem" }} />
              <p style={{ color: "#7A6050" }}>No invoices yet.</p>
              <Link to="/invoices/new" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                <PlusCircle size={16} /> Create your first invoice
              </Link>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--off-white)", borderBottom: "1px solid var(--border)" }}>
                  {["Invoice #", "Receiver", "Date", "Amount", "Status", ""].map(h => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 600, color: "#7A6050", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, idx) => (
                  <tr key={inv.id} style={{ borderBottom: idx < invoices.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--off-white)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "0.9rem 1rem", fontWeight: 600, color: "#6F4E37", fontSize: "0.9rem" }}>{inv.invoiceNumber}</td>
                    <td style={{ padding: "0.9rem 1rem", fontSize: "0.9rem" }}>
                      <div style={{ fontWeight: 500 }}>{inv.receiver.name}</div>
                      <div style={{ color: "#A08070", fontSize: "0.8rem" }}>{inv.receiver.company || inv.receiver.email}</div>
                    </td>
                    <td style={{ padding: "0.9rem 1rem", fontSize: "0.85rem", color: "#7A6050" }}>{fmtDate(inv.issueDate)}</td>
                    <td style={{ padding: "0.9rem 1rem", fontWeight: 600, fontSize: "0.9rem" }}>{formatMoney(inv.total, inv.currency)}</td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <span className={`badge badge-${inv.status}`}>{inv.status}</span>
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <Link to={`/invoices/${inv.id}`} className="btn btn-ghost" style={{ padding: "0.3rem 0.7rem", fontSize: "0.8rem" }}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
  <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.2rem 1.4rem" }}>
    <div style={{ background: "var(--off-white-dark)", borderRadius: "10px", padding: "0.6rem", display: "flex" }}>{icon}</div>
    <div>
      <div style={{ fontSize: "0.78rem", color: "#7A6050", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#2C1A0E", fontFamily: "Inter, sans-serif" }}>{value}</div>
    </div>
  </div>
);

export default Dashboard;
