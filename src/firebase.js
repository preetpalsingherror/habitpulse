import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let auth;
let db;
let googleProvider;
let isFirebaseEnabled = false;

const hasApiKey = typeof firebaseConfig.apiKey === 'string' && firebaseConfig.apiKey.trim().length > 0;

if (hasApiKey) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    isFirebaseEnabled = true;
    console.log("🔥 Firebase initialized successfully.");
  } catch (error) {
    console.error("🔥 Firebase initialization failed:", error);
  }
} else {
  console.warn("🔥 Firebase VITE_FIREBASE_API_KEY is undefined or empty. LocalStorage fallback is active.");
}

export { auth, db, googleProvider, isFirebaseEnabled };
