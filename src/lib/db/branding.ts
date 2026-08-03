import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

/**
 * Brand identity managed from the admin panel (Admin → Branding).
 * Stored in a single Firestore document so the storefront can read it publicly.
 */
export interface BrandingSettings {
  /** Logo shown in the storefront header (desktop + mobile). */
  headerLogoUrl: string;
  /** Logo shown inside the mobile navigation drawer. Falls back to the header logo. */
  drawerLogoUrl: string;
  /** Logo shown in the storefront footer. Falls back to the header logo. */
  footerLogoUrl: string;
  /** Logo shown in the admin sidebar. Falls back to the header logo. */
  adminLogoUrl: string;
  /** Brand wordmark rendered next to the logo. */
  wordmark: string;
  /** Toggle the wordmark text on/off (useful when the logo already contains it). */
  showWordmark: boolean;
  /** Rendered logo height in px for the storefront header. */
  logoHeight: number;
  /** Alt text used for every logo image. */
  altText: string;
}

export const defaultBranding: BrandingSettings = {
  headerLogoUrl: "",
  drawerLogoUrl: "",
  footerLogoUrl: "",
  adminLogoUrl: "",
  wordmark: "DHARAJ",
  showWordmark: true,
  logoHeight: 36,
  altText: "DHARAJ",
};

const brandingDoc = () => doc(getFirebaseDb(), "siteSettings", "branding");

export async function getBranding(): Promise<BrandingSettings> {
  try {
    const snap = await getDoc(brandingDoc());
    if (!snap.exists()) return defaultBranding;
    const data = snap.data() as Partial<BrandingSettings>;
    return {
      ...defaultBranding,
      ...data,
      logoHeight: Number(data.logoHeight) || defaultBranding.logoHeight,
    };
  } catch (error) {
    console.warn("Failed to load branding", error);
    return defaultBranding;
  }
}

export async function saveBranding(branding: BrandingSettings): Promise<void> {
  await setDoc(
    brandingDoc(),
    { ...branding, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
