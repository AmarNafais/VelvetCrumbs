import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration using environment variables for security
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "velvet-crumbs-47af6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "velvet-crumbs-47af6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "velvet-crumbs-47af6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "916622452516",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:916622452516:web:9a0e40e9735b11f8e975b1",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-TBFG90TKJM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in production and if measurement ID is provided)
let analytics;
if (typeof window !== 'undefined' && import.meta.env.PROD && firebaseConfig.measurementId) {
  analytics = getAnalytics(app);
}

export { app, analytics };