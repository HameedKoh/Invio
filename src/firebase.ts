import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC8zzI5trNKkKKJh2tBDMfFL1UNvRhrdA4",
  authDomain: "invioio.firebaseapp.com",
  projectId: "invioio",
  messagingSenderId: "634745618967",
  appId: "1:634745618967:web:3443dbc74a4aca58851252",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
