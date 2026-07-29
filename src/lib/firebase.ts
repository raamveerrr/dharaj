// Firebase client — initialized lazily on the browser only.
// Auth uses browser APIs (IndexedDB/localStorage), so we guard against SSR.
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDDHJ9RZneVEWV51bCBk8Kaw2CUPx48BCA",
  authDomain: "dharaj-73114.firebaseapp.com",
  projectId: "dharaj-73114",
  storageBucket: "dharaj-73114.firebasestorage.app",
  messagingSenderId: "700168607838",
  appId: "1:700168607838:web:123c32f7063ac9d3723ccf",
  measurementId: "G-CVCXDM1KD2",
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function ensureBrowser() {
  if (typeof window === "undefined") {
    throw new Error("Firebase can only be accessed in the browser.");
  }
}

export function getFirebaseApp(): FirebaseApp {
  ensureBrowser();
  if (_app) return _app;
  _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(getFirebaseApp());
  return _auth;
}

export function getFirebaseDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(getFirebaseApp());
  return _db;
}

/** Human-friendly messages for Firebase Auth error codes. */
export function firebaseAuthErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again in a few minutes.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/requires-recent-login":
      return "Please sign in again to continue.";
    case "auth/expired-action-code":
    case "auth/invalid-action-code":
      return "This link has expired or is invalid. Request a new one.";
    default:
      return (err as { message?: string })?.message ?? "Something went wrong. Please try again.";
  }
}
