import React from "react";
import type { Invoice, UserBrand } from "../types";
import { formatMoney } from "../utils/money";

interface Props {
  invoice: Invoice;
  brand: UserBrand;
}

const InvoicePreview: React.FC<Props> = ({ invoice, brand }) => {
  const fmt = (n: number) => formatMoney(n, invoice.currency);

  const pay = invoice.paymentDetails ?? {
    bankName: brand.bankName || "",
    accountName: brand.accountName || "",
    accountNumber: brand.accountNumber || "",
  };
  const hasPay = !!(pay.bankName || pay.accountName || pay.accountNumber);

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div id="invoice-print" style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.brandSection}>
          {brand.logoUrl && (
            <img src={brand.logoUrl} alt={brand.brandName} style={styles.logo} />
          )}
          <div>
            <div style={styles.brandName}>{brand.brandName}</div>
            <div style={styles.brandDetail}>{brand.address}</div>
            <div style={styles.brandDetail}>{brand.city}, {brand.country}</div>
            <div style={styles.brandDetail}>{brand.phone}</div>
            {brand.website && <div style={styles.brandDetail}>{brand.website}</div>}
            {brand.taxId && <div style={styles.brandDetail}>Tax ID: {brand.taxId}</div>}
          </div>
        </div>

        <div style={styles.invoiceInfo}>
          <div style={styles.invioLabel}>INVOICE</div>
          <div style={styles.invioNum}>{invoice.invoiceNumber}</div>
          <div style={styles.infoGrid}>
            <div style={styles.infoLabel}>Issue Date</div>
            <div style={styles.infoVal}>{fmtDate(invoice.issueDate)}</div>
            <div style={styles.infoLabel}>Due Date</div>
            <div style={{ ...styles.infoVal, color: "#6F4E37", fontWeight: 700 }}>{fmtDate(invoice.dueDate)}</div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Bill To */}
      <div style={styles.billSection}>
        <div>
          <div style={styles.sectionLabel}>BILL FROM</div>
          <div style={styles.partyName}>{brand.ownerName}</div>
          <div style={styles.partyDetail}>{brand.email}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={styles.sectionLabel}>BILL TO</div>
          <div style={styles.partyName}>{invoice.receiver.name}</div>
          {invoice.receiver.company && <div style={styles.partyDetail}>{invoice.receiver.company}</div>}
          <div style={styles.partyDetail}>{invoice.receiver.email}</div>
          {invoice.receiver.phone && <div style={styles.partyDetail}>{invoice.receiver.phone}</div>}
          {invoice.receiver.address && (
            <div style={styles.partyDetail}>
              {invoice.receiver.address}, {invoice.receiver.city}, {invoice.receiver.country}
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <table style={styles.table}>
        <thead>
          <tr style={{ background: "#6F4E37" }}>
            <th style={{ ...styles.th, width: "50%", borderRadius: "6px 0 0 0" }}>Description</th>
            <th style={{ ...styles.th, textAlign: "center", width: "10%" }}>Qty</th>
            <th style={{ ...styles.th, textAlign: "right", width: "20%" }}>Unit Price</th>
            <th style={{ ...styles.th, textAlign: "right", width: "20%", borderRadius: "0 6px 0 0" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={item.id} style={{ background: idx % 2 === 0 ? "#FFFFFF" : "#FAF8F5" }}>
              <td style={styles.td}>{item.description}</td>
              <td style={{ ...styles.td, textAlign: "center" }}>{item.quantity}</td>
              <td style={{ ...styles.td, textAlign: "right" }}>{fmt(item.unitPrice)}</td>
              <td style={{ ...styles.td, textAlign: "right", fontWeight: 600 }}>{fmt(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={styles.totalsWrap}>
        <div style={styles.totalsBox}>
          <div style={styles.totalRow}>
            <span>Subtotal</span>
            <span>{fmt(invoice.subtotal)}</span>
          </div>
          {invoice.taxRate > 0 && (
            <div style={styles.totalRow}>
              <span>Tax ({invoice.taxRate}%)</span>
              <span>{fmt(invoice.taxAmount)}</span>
            </div>
          )}
          {invoice.discount > 0 && (
            <div style={styles.totalRow}>
              <span>Discount</span>
              <span style={{ color: "#2E7D32" }}>-{fmt(invoice.discount)}</span>
            </div>
          )}
          <div style={styles.grandTotal}>
            <span>TOTAL DUE</span>
            <span>{fmt(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* Payment details */}
      {hasPay && (
        <div style={styles.notes}>
          <div style={styles.sectionLabel}>PAYMENT DETAILS</div>
          <div style={styles.payGrid}>
            {pay.bankName && (<><span style={styles.infoLabel}>Bank</span><span style={styles.infoVal}>{pay.bankName}</span></>)}
            {pay.accountName && (<><span style={styles.infoLabel}>Account Name</span><span style={styles.infoVal}>{pay.accountName}</span></>)}
            {pay.accountNumber && (<><span style={styles.infoLabel}>Account Number</span><span style={{ ...styles.infoVal, fontWeight: 700, letterSpacing: "0.05em" }}>{pay.accountNumber}</span></>)}
          </div>
        </div>
      )}

      {/* Notes */}
      {invoice.notes && (
        <div style={styles.notes}>
          <div style={styles.sectionLabel}>NOTES &amp; TERMS</div>
          <p style={{ fontSize: "0.85rem", color: "#5A4030", lineHeight: 1.6, marginTop: "0.4rem" }}>{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerBrand}>INVIO<span style={{ fontSize: "0.6rem", color: "#C9A882", marginLeft: 2 }}>●</span></div>
        <div style={styles.footerText}>Thank you for your business!</div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { background: "#FFFFFF", maxWidth: 780, margin: "0 auto", padding: "3rem 3.5rem", fontFamily: "Inter, sans-serif", boxShadow: "0 4px 40px rgba(111,78,55,0.12)", borderRadius: 12 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" },
  brandSection: { display: "flex", gap: "1rem", alignItems: "flex-start" },
  logo: { width: 60, height: 60, objectFit: "contain", borderRadius: 8 },
  brandName: { fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700, color: "#6F4E37", marginBottom: "0.3rem" },
  brandDetail: { fontSize: "0.8rem", color: "#7A6050", lineHeight: 1.7 },
  invoiceInfo: { textAlign: "right" },
  invioLabel: { fontSize: "0.7rem", fontWeight: 700, color: "#C9A882", letterSpacing: "0.15em", marginBottom: "0.25rem" },
  invioNum: { fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700, color: "#2C1A0E", marginBottom: "0.7rem" },
  infoGrid: { display: "grid", gridTemplateColumns: "auto auto", gap: "0.2rem 1rem", textAlign: "left" },
  infoLabel: { fontSize: "0.75rem", color: "#A08070", textTransform: "uppercase", letterSpacing: "0.05em" },
  infoVal: { fontSize: "0.85rem", color: "#2C1A0E", fontWeight: 500 },
  divider: { height: 3, background: "linear-gradient(90deg, #6F4E37, #C9A882)", borderRadius: 2, margin: "1rem 0" },
  billSection: { display: "flex", justifyContent: "space-between", marginBottom: "2rem" },
  sectionLabel: { fontSize: "0.68rem", fontWeight: 700, color: "#C9A882", letterSpacing: "0.12em", marginBottom: "0.4rem" },
  partyName: { fontSize: "1rem", fontWeight: 700, color: "#2C1A0E", marginBottom: "0.2rem" },
  partyDetail: { fontSize: "0.82rem", color: "#7A6050", lineHeight: 1.6 },
  table: { width: "100%", borderCollapse: "collapse", marginBottom: "1.5rem" },
  th: { padding: "0.7rem 0.9rem", textAlign: "left", fontSize: "0.75rem", color: "#FFFFFF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
  td: { padding: "0.75rem 0.9rem", fontSize: "0.88rem", color: "#2C1A0E", borderBottom: "1px solid #F0EBE3" },
  totalsWrap: { display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" },
  totalsBox: { width: 260 },
  totalRow: { display: "flex", justifyContent: "space-between", padding: "0.4rem 0", fontSize: "0.88rem", color: "#5A4030" },
  grandTotal: { display: "flex", justifyContent: "space-between", padding: "0.6rem 0.8rem", background: "#6F4E37", color: "#FFFFFF", borderRadius: 8, fontWeight: 700, fontSize: "0.95rem", marginTop: "0.5rem" },
  payGrid: { display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.3rem 1.2rem", marginTop: "0.4rem" },
  notes: { background: "#FAF8F5", border: "1px solid #F0EBE3", borderRadius: 8, padding: "1rem", marginBottom: "1.5rem" },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F0EBE3", paddingTop: "1rem", marginTop: "0.5rem" },
  footerBrand: { fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 700, color: "#C9A882" },
  footerText: { fontSize: "0.8rem", color: "#A08070", fontStyle: "italic" },
};

export default InvoicePreview;
