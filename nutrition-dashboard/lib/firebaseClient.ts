import { getApps, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDJecSKaPNDvPbjqeAhqlnYhtTfilMWQbM",
  authDomain: "diettracking-b2e81.firebaseapp.com",
  projectId: "diettracking-b2e81",
  storageBucket: "diettracking-b2e81.firebasestorage.app",
  messagingSenderId: "859342666417",
  appId: "1:859342666417:web:04396cf5aa096cd9c5c090",
  measurementId: "G-5CC958JNYQ",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, analytics, auth, firestore };