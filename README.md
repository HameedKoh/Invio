# INVIO — Professional Invoice Creator

INVIO is a full-stack web application for creating, managing, and printing professional invoices. Built with React + TypeScript + Firebase.

## 🎨 Design
- **Primary color**: Off-white (`#FAF8F5`)
- **Secondary color**: Coffee Brown (`#6F4E37`)
- **Fonts**: Playfair Display (headings) + Inter (body)

## ✨ Features
- ✅ **Authentication** — Email/password sign-up and login (Firebase Auth)
- ✅ **Brand Profile** — Name, logo, address, phone, website, Tax ID
- ✅ **Invoice Creator** — Line items, tax, discount, currency selector
- ✅ **Unique Invoice IDs** — Auto-generated per-user sequential numbers (e.g. `INV-A1B2-2026-0001`)
- ✅ **Auto-save on Print** — Every printed invoice is stored in Firestore with timestamp
- ✅ **Invoice History** — Dashboard with all past invoices
- ✅ **Print-Ready** — Clean A4 print layout, UI chrome hidden on print

## 🚀 Getting Started

### 1. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database** (production mode)
5. (No Storage needed. Logos are stored inside Firestore.)
6. Go to **Project Settings → Your Apps** → Add a Web App
7. Copy the SDK config values

### 2. Environment Variables
```bash
cp .env.example .env
```
Edit `.env` and paste your Firebase values:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3. Firestore Rules
Deploy the included security rules:
```bash
firebase deploy --only firestore:rules,firestore:indexes
```
Or paste `firestore.rules` content into Firebase Console → Firestore → Rules.

### 4. Run Locally
```bash
npm install
npm run dev
```

### 5. Build for Production
```bash
npm run build
npm run preview
```

## 📁 Project Structure
```
src/
├── components/
│   ├── Navbar.tsx          # Top navigation
│   ├── PrivateRoute.tsx    # Auth guard
│   └── InvoicePreview.tsx  # Print-ready invoice template
├── context/
│   └── AuthContext.tsx     # Firebase auth state
├── pages/
│   ├── Landing.tsx         # Public landing page
│   ├── Login.tsx           # Sign in
│   ├── Register.tsx        # 2-step sign up + brand setup
│   ├── Dashboard.tsx       # Invoice history + stats
│   ├── Profile.tsx         # Edit brand info
│   ├── NewInvoice.tsx      # Create invoice
│   └── InvoiceView.tsx     # View/print saved invoice
├── services/
│   └── firestore.ts        # All Firestore CRUD operations
├── types/
│   └── index.ts            # TypeScript interfaces
├── firebase.ts             # Firebase initialization
├── theme.ts                # Color constants
├── index.css               # Global styles
└── print.css               # Print media queries
```

## 🔒 Security
- Each user can only access their own brands and invoices (Firestore rules)
- Logo uploads are scoped per user UID in Firebase Storage
- All sensitive config via environment variables (never committed)
