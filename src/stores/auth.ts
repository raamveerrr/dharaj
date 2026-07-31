import { create } from "zustand";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";

export type UserRole = "customer" | "admin";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isAdmin: boolean;
  createdAt?: unknown;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean; // initial hydration
  initialized: boolean;
  sessionExpired: boolean;
  init: () => void;
  register: (email: string, password: string, displayName: string, phone?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  sendReset: (email: string) => Promise<void>;
  updateProfileFields: (fields: Partial<Pick<UserProfile, "displayName" | "phone" | "avatarUrl">>) => Promise<void>;
  markSessionExpired: () => void;
  clearSessionExpired: () => void;
}

let unsub: (() => void) | null = null;

async function loadProfile(user: User): Promise<UserProfile> {
  const db = getFirebaseDb();
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data() as Partial<UserProfile>;
    const role: UserRole = data.role === "admin" || data.isAdmin === true ? "admin" : "customer";
    return {
      uid: user.uid,
      email: user.email,
      displayName: data.displayName ?? user.displayName ?? null,
      phone: data.phone ?? null,
      avatarUrl: data.avatarUrl ?? null,
      role,
      isAdmin: role === "admin",
    };
  }
  // Auto-create profile if missing (e.g. legacy accounts).
  const fresh: UserProfile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    phone: null,
    avatarUrl: null,
    role: "customer",
    isAdmin: false,
  };
  await setDoc(ref, { ...fresh, createdAt: serverTimestamp() });
  return fresh;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  sessionExpired: false,

  init: () => {
    if (typeof window === "undefined") return;
    if (get().initialized) return;
    set({ initialized: true });
    const auth = getFirebaseAuth();
    if (unsub) unsub();
    unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        set({ user: null, profile: null, loading: false });
        return;
      }
      try {
        const profile = await loadProfile(user);
        set({ user, profile, loading: false });
      } catch {
        set({ user, profile: null, loading: false });
      }
    });
  },

  register: async (email, password, displayName, phone) => {
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    const profile: UserProfile = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName,
      phone: phone ?? null,
      avatarUrl: null,
      role: "customer",
      isAdmin: false,
    };
    await setDoc(doc(db, "users", cred.user.uid), { ...profile, createdAt: serverTimestamp() });
    set({ user: cred.user, profile, sessionExpired: false });
  },

  login: async (email, password) => {
    const auth = getFirebaseAuth();
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await loadProfile(cred.user);
    set({ user: cred.user, profile, sessionExpired: false });
    return cred.user;
  },

  loginWithGoogle: async () => {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const cred = await signInWithPopup(auth, provider);
    const profile = await loadProfile(cred.user);
    set({ user: cred.user, profile, sessionExpired: false });
    return cred.user;
  },

  logout: async () => {
    const auth = getFirebaseAuth();
    await fbSignOut(auth);
    set({ user: null, profile: null });
  },

  sendReset: async (email) => {
    const auth = getFirebaseAuth();
    await sendPasswordResetEmail(auth, email, {
      url: typeof window !== "undefined" ? `${window.location.origin}/auth/login` : "https://dharaj.lovable.app/auth/login",
    });
  },

  updateProfileFields: async (fields) => {
    const { user, profile } = get();
    if (!user || !profile) return;
    const db = getFirebaseDb();
    await setDoc(doc(db, "users", user.uid), { ...fields }, { merge: true });
    set({ profile: { ...profile, ...fields } });
  },

  markSessionExpired: () => set({ sessionExpired: true }),
  clearSessionExpired: () => set({ sessionExpired: false }),
}));
