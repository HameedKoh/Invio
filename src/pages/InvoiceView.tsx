import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInvoice, markInvoicePrinted, getBrand } from "../services/firestore";
import type { Invoice, UserBrand } from "../types";
import InvoicePreview from "../components/InvoicePreview";
import { ArrowLeft, Printer, CheckCircle2 } from "lucide-react";

const InvoiceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [brand, setBrand] = useState<UserBrand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getInvoice(id).then(async (inv: Invoice | null) => {
      if (inv) {
        setInvoice(inv);
        const br = await getBrand(inv.uid);
        setBrand(br);
      }
      setLoading(false);
    });
  }, [id]);

  const handlePrint = async () => {
    if (!invoice) return;
    if (invoice.status === "draft") {
      await markInvoicePrinted(invoice.id);
      setInvoice((prev: Invoice | null) => prev ? { ...prev, status: "printed" } : prev);
    }
    window.print();
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      <span className="spinner spinner-dark" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  );

  if (!invoice || !brand) return (
    <div style={{ padding: "4rem", textAlign: "center" }}>
      <p style={{ color: "#7A6050" }}>Invoice not found.</p>
      <button className="btn btn-primary" onClick={() => navigate("/dashboard")} style={{ marginTop: "1rem" }}>
        Go to Dashboard
      </button>
    </div>
  );

  return (
    <div className="page">
      <div className="container" style={{ padding: "2rem 1.5rem" }}>
        {/* Controls — hidden on print */}
        <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span className={`badge badge-${invoice.status}`}>{invoice.status}</span>
            <button className="btn btn-primary" onClick={handlePrint}>
              <Printer size={16} /> Print Invoice
            </button>
          </div>
        </div>

        {invoice.status === "printed" && (
          <div className="no-print" style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#E8F5E9", border: "1px solid #C8E6C9", color: "#2E7D32", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.88rem" }}>
            <CheckCircle2 size={16} /> This invoice has been printed and saved on {invoice.printedAt ? new Date(invoice.printedAt).toLocaleString() : ""}.
          </div>
        )}

        <InvoicePreview invoice={invoice} brand={brand} />
      </div>
    </div>
  );
};

export default InvoiceView;
