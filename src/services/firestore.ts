import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import type { UserBrand, Invoice, ReceiverInfo, InvoiceItem, PaymentDetails } from "../types";

// ─── Brand ───────────────────────────────────────────────────────────────────

export const saveBrand = async (uid: string, data: Omit<UserBrand, "uid" | "createdAt">) => {
  await setDoc(doc(db, "brands", uid), {
    ...data,
    uid,
    createdAt: new Date().toISOString(),
  });
};

export const getBrand = async (uid: string): Promise<UserBrand | null> => {
  const snap = await getDoc(doc(db, "brands", uid));
  return snap.exists() ? (snap.data() as UserBrand) : null;
};

export const updateBrand = async (uid: string, data: Partial<UserBrand>) => {
  await updateDoc(doc(db, "brands", uid), data);
};

// ─── Invoice ─────────────────────────────────────────────────────────────────

export const generateInvoiceNumber = (uid: string, count: number): string => {
  const year = new Date().getFullYear();
  const seq = String(count + 1).padStart(4, "0");
  const prefix = uid.slice(0, 4).toUpperCase();
  return `INV-${prefix}-${year}-${seq}`;
};

export const createInvoice = async (
  uid: string,
  brand: UserBrand,
  receiver: ReceiverInfo,
  items: InvoiceItem[],
  options: {
    taxRate: number;
    discount: number;
    currency: string;
    dueDate: string;
    notes?: string;
    paymentDetails: PaymentDetails;
  }
): Promise<Invoice> => {
  const invoicesRef = collection(db, "invoices");
  const existingQ = query(invoicesRef, where("uid", "==", uid));
  const existingSnap = await getDocs(existingQ);
  const count = existingSnap.size;

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const taxAmount = (subtotal * options.taxRate) / 100;
  const total = subtotal + taxAmount - options.discount;

  const invoiceId = doc(collection(db, "invoices")).id;
  const invoiceNumber = generateInvoiceNumber(uid, count);

  const invoice: Invoice = {
    id: invoiceId,
    invoiceNumber,
    uid,
    brandSnapshot: brand,
    receiver,
    items,
    subtotal,
    taxRate: options.taxRate,
    taxAmount,
    discount: options.discount,
    total,
    currency: options.currency,
    notes: options.notes,
    paymentDetails: options.paymentDetails,
    dueDate: options.dueDate,
    issueDate: new Date().toISOString().split("T")[0],
    status: "draft",
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, "invoices", invoiceId), invoice);
  return invoice;
};

export const markInvoicePrinted = async (invoiceId: string) => {
  await updateDoc(doc(db, "invoices", invoiceId), {
    status: "printed",
    printedAt: new Date().toISOString(),
  });
};

export const getUserInvoices = async (uid: string): Promise<Invoice[]> => {
  // Single-field filter only, so no composite index is needed.
  // Newest first is done on the client.
  const q = query(collection(db, "invoices"), where("uid", "==", uid));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as Invoice)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const getInvoice = async (invoiceId: string): Promise<Invoice | null> => {
  const snap = await getDoc(doc(db, "invoices", invoiceId));
  return snap.exists() ? (snap.data() as Invoice) : null;
};
