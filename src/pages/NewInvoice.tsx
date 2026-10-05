import React, { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useAuth } from "../context/AuthContext";
import { getBrand, createInvoice, markInvoicePrinted } from "../services/firestore";
import type { UserBrand, InvoiceItem, ReceiverInfo, Invoice } from "../types";
import { useNavigate, Link } from "react-router-dom";
import { PlusCircle, Trash2, Printer, Save, ChevronDown } from "lucide-react";
import InvoicePreview from "../components/InvoicePreview";
import { formatMoney } from "../utils/money";

const CURRENCIES = ["NGN", "USD", "EUR", "GBP", "GHS", "KES", "ZAR", "CAD", "AUD"];

const emptyItem = (): InvoiceItem => ({
  id: crypto.randomUUID(),
  description: "",
  quantity: 1,
  unitPrice: 0,
  total: 0,
});

const emptyReceiver = (): ReceiverInfo => ({
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  company: "",
});

const NewInvoice: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

  const [brand, setBrand] = useState<UserBrand | null>(null);
  const [receiver, setReceiver] = useState<ReceiverInfo>(emptyReceiver());
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [currency, setCurrency] = useState("NGN");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState({ bankName: "", accountName: "", accountNumber: "" });
  const [saving, setSaving] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser) return;
    getBrand(currentUser.uid).then((b: UserBrand | null) => {
      if (b) {
        setBrand(b);
        setPayment({
          bankName: b.bankName || "",
          accountName: b.accountName || "",
          accountNumber: b.accountNumber || "",
        });
      }
      else navigate("/profile");
    });
  }, [currentUser, navigate]);

  const updateItem = (id: string, k: keyof InvoiceItem, v: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [k]: v };
      updated.total = Number(updated.quantity) * Number(updated.unitPrice);
      return updated;
    }));
  };

  const addItem = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount - discount;

  const fmt = (n: number) => formatMoney(n, currency);

  const handleSave = async (): Promise<Invoice | null> => {
    if (!currentUser || !brand) return null;
    if (!receiver.name || !receiver.email) { setError("Receiver name and email are required."); return null; }
    if (items.some(i => !i.description)) { setError("All line items must have a description."); return null; }
    setError("");
    setSaving(true);
    try {
      const inv = await createInvoice(currentUser.uid, brand, receiver, items, { taxRate, discount, currency, dueDate, notes, paymentDetails: payment });
      setSavedInvoice(inv);
      return inv;
    } catch {
      setError("Failed to save invoice. Please try again.");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = async () => {
    const inv = savedInvoice ?? (await handleSave());
    if (!inv) return;
    try { await markInvoicePrinted(inv.id); } catch { /* printing still works */ }
    // Make sure the invoice is on screen before the print dialog opens.
    flushSync(() => setSavedInvoice({ ...inv, status: "printed" }));
    window.print();
  };

  const setRec = (k: keyof ReceiverInfo) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setReceiver(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="page">
      <div className="container" style={{ padding: "2rem 1.5rem" }}>
        <div className="no-print">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem" }}>New Invoice</h1>
            <p style={{ color: "#7A6050", fontSize: "0.9rem" }}>Fill in details below to generate your invoice</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>Cancel</button>
            <button className="btn btn-outline" onClick={() => { void handleSave(); }} disabled={saving}>
              <Save size={16} /> {saving ? <span className="spinner spinner-dark" /> : "Save Draft"}
            </button>
            <button className="btn btn-primary" onClick={handlePrint}>
              <Printer size={16} /> {savedInvoice ? "Print" : "Save & Print"}
            </button>
          </div>
        </div>

        {error && <div style={errStyle}>{error}</div>}
        {savedInvoice && <div style={okStyle}>✓ Invoice {savedInvoice.invoiceNumber} saved! Click "Print" to print it. Only the invoice will be printed.</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
          {/* Options */}
          <div className="card">
            <h3 style={sh}>Invoice Settings</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="field">
                <label className="label">Currency</label>
                <div style={{ position: "relative" }}>
                  <select className="inp" value={currency} onChange={e => setCurrency(e.target.value)}
                    style={{ appearance: "none", paddingRight: "2rem", cursor: "pointer" }}>
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: "absolute", right: "0.8rem", top: "50%", transform: "translateY(-50%)", color: "#A08070", pointerEvents: "none" }} />
                </div>
              </div>
              <div className="field">
                <label className="label">Due Date</label>
                <input type="date" className="inp" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
              <div className="grid-2">
                <div className="field">
                  <label className="label">Tax Rate (%)</label>
                  <input type="number" className="inp" min={0} max={100} step={0.1}
                    value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} />
                </div>
                <div className="field">
                  <label className="label">Discount ({currency})</label>
                  <input type="number" className="inp" min={0} step={0.01}
                    value={discount} onChange={e => setDiscount(Number(e.target.value))} />
                </div>
              </div>
            </div>
          </div>

          {/* Receiver */}
          <div className="card">
            <h3 style={sh}>Bill To (Receiver)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div className="grid-2">
                <div className="field">
                  <label className="label">Name *</label>
                  <input type="text" className="inp" placeholder="Jane Smith" value={receiver.name} onChange={setRec("name")} required />
                </div>
                <div className="field">
                  <label className="label">Company</label>
                  <input type="text" className="inp" placeholder="Smith LLC" value={receiver.company} onChange={setRec("company")} />
                </div>
              </div>
              <div className="grid-2">
                <div className="field">
                  <label className="label">Email *</label>
                  <input type="email" className="inp" placeholder="jane@co.com" value={receiver.email} onChange={setRec("email")} required />
                </div>
                <div className="field">
                  <label className="label">Phone</label>
                  <input type="tel" className="inp" placeholder="+1 555 ..." value={receiver.phone} onChange={setRec("phone")} />
                </div>
              </div>
              <div className="field">
                <label className="label">Address</label>
                <input type="text" className="inp" placeholder="456 Elm Ave" value={receiver.address} onChange={setRec("address")} />
              </div>
              <div className="grid-2">
                <div className="field">
                  <label className="label">City</label>
                  <input type="text" className="inp" placeholder="Chicago" value={receiver.city} onChange={setRec("city")} />
                </div>
                <div className="field">
                  <label className="label">Country</label>
                  <input type="text" className="inp" placeholder="United States" value={receiver.country} onChange={setRec("country")} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={sh}>Line Items</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Description", "Qty", "Unit Price", "Total", ""].map(h => (
                  <th key={h} style={{ padding: "0.5rem 0.5rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 600, color: "#7A6050", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.5rem" }}>
                    <input type="text" className="inp" placeholder="Service or product description"
                      value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} />
                  </td>
                  <td style={{ padding: "0.5rem", width: 80 }}>
                    <input type="number" className="inp" min={1} value={item.quantity}
                      onChange={e => updateItem(item.id, "quantity", Number(e.target.value))} style={{ textAlign: "center" }} />
                  </td>
                  <td style={{ padding: "0.5rem", width: 130 }}>
                    <input type="number" className="inp" min={0} step={0.01} value={item.unitPrice}
                      onChange={e => updateItem(item.id, "unitPrice", Number(e.target.value))} />
                  </td>
                  <td style={{ padding: "0.5rem", width: 130, fontWeight: 600, color: "#6F4E37" }}>{fmt(item.total)}</td>
                  <td style={{ padding: "0.5rem", width: 40 }}>
                    {items.length > 1 && (
                      <button className="btn btn-ghost" style={{ padding: "0.3rem", color: "#D32F2F", borderColor: "transparent" }}
                        onClick={() => removeItem(item.id)}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn btn-ghost" onClick={addItem}>
            <PlusCircle size={16} color="#6F4E37" /> Add Item
          </button>

          {/* Totals */}
          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
            <div style={{ width: 260, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={row}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              {taxRate > 0 && <div style={row}><span>Tax ({taxRate}%)</span><span>{fmt(taxAmount)}</span></div>}
              {discount > 0 && <div style={row}><span>Discount</span><span style={{ color: "#2E7D32" }}>-{fmt(discount)}</span></div>}
              <hr className="divider" style={{ margin: "0.3rem 0" }} />
              <div style={{ ...row, fontWeight: 700, fontSize: "1.05rem", color: "#2C1A0E" }}>
                <span>Total</span><span>{fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment details */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={sh}>Payment Details</h3>
          <p style={{ fontSize: "0.82rem", color: "#7A6050", marginBottom: "1rem" }}>
            Pulled from your brand profile and shown on the invoice. Edit here for this invoice only, or{" "}
            <Link to="/profile" style={{ color: "#6F4E37", fontWeight: 600 }}>update your profile</Link> to change it everywhere.
          </p>
          <div className="grid-2" style={{ marginBottom: "0.85rem" }}>
            <div className="field">
              <label className="label">Bank Name</label>
              <input type="text" className="inp" placeholder="GTBank" value={payment.bankName}
                onChange={e => setPayment(p => ({ ...p, bankName: e.target.value }))} />
            </div>
            <div className="field">
              <label className="label">Account Number</label>
              <input type="text" inputMode="numeric" className="inp" placeholder="0123456789" value={payment.accountNumber}
                onChange={e => setPayment(p => ({ ...p, accountNumber: e.target.value }))} />
            </div>
          </div>
          <div className="field">
            <label className="label">Account Name</label>
            <input type="text" className="inp" placeholder="BlvckMotion Studio" value={payment.accountName}
              onChange={e => setPayment(p => ({ ...p, accountName: e.target.value }))} />
          </div>
        </div>

        {/* Notes */}
        <div className="card" style={{ marginBottom: "2rem" }}>
          <h3 style={sh}>Notes / Terms</h3>
          <textarea className="inp" rows={3} placeholder="Payment terms, thank you note..."
            value={notes} onChange={e => setNotes(e.target.value)}
            style={{ resize: "vertical", fontFamily: "Inter, sans-serif" }} />
        </div>

        </div>

        {/* Preview */}
        {savedInvoice && brand && (
          <div>
            <div className="no-print">
              <hr className="divider" />
              <h2 style={{ marginBottom: "1rem", fontSize: "1.3rem" }}>Invoice Preview</h2>
            </div>
            <div ref={printRef}>
              <InvoicePreview invoice={savedInvoice} brand={brand} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const sh: React.CSSProperties = { marginBottom: "1rem", fontSize: "0.95rem", fontFamily: "Inter, sans-serif", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" };
const row: React.CSSProperties = { display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#5A4030" };
const errStyle: React.CSSProperties = { background: "#FFEBEE", border: "1px solid #FFCDD2", color: "#C62828", borderRadius: "8px", padding: "0.75rem 1rem", fontSize: "0.87rem", marginBottom: "1rem" };
const okStyle: React.CSSProperties = { background: "#E8F5E9", border: "1px solid #C8E6C9", color: "#2E7D32", borderRadius: "8px", padding: "0.75rem 1rem", fontSize: "0.87rem", marginBottom: "1rem" };

export default NewInvoice;
