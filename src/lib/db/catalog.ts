import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  setDoc,
  getDoc,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { products as seedProducts, heroSlides, announcements, shortcuts } from "@/lib/data";
import { productImages, heroImage, shortcutImage } from "@/lib/mockImages";

/* ----------------------------- Products ----------------------------- */

export interface DbProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  weight: string;
  price: number;
  mrp: number;
  stock: number;
  sku: string;
  imageUrls: string[];
  bestSeller?: boolean;
  newArrival?: boolean;
  featured?: boolean;
  createdAt?: unknown;
}

export type ProductInput = Omit<DbProduct, "id" | "createdAt">;

const productsCol = () => collection(getFirebaseDb(), "products");

export async function listProducts(): Promise<DbProduct[]> {
  const snap = await getDocs(query(productsCol(), orderBy("name")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DbProduct, "id">) }));
}

export async function createProduct(input: ProductInput): Promise<string> {
  const res = await addDoc(productsCol(), { ...input, createdAt: serverTimestamp() });
  return res.id;
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), "products", id), { ...input });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), "products", id));
}

/** One-time helper: copies the local demo catalogue into Firestore. */
export async function seedProductsToFirestore(): Promise<number> {
  const db = getFirebaseDb();
  const batch = writeBatch(db);
  seedProducts.forEach((p) => {
    batch.set(doc(db, "products", p.id), {
      name: p.name,
      category: p.category,
      description: p.description,
      weight: p.weight,
      price: p.price,
      mrp: p.mrp,
      stock: p.stock,
      sku: p.sku,
      imageUrls: productImages(p.id, p.category, 5, 800),
      bestSeller: !!p.bestSeller,
      newArrival: !!p.newArrival,
      featured: !!p.featured,
      createdAt: serverTimestamp(),
    });
  });
  await batch.commit();
  return seedProducts.length;
}

/* ----------------------------- Homepage ----------------------------- */

export interface Banner {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  imageUrl: string;
}

export interface Shortcut {
  id: string;
  label: string;
  href: string;
  imageUrl: string;
}

export interface Announcement {
  id: string;
  text: string;
}

export interface HomepageContent {
  banners: Banner[];
  shortcuts: Shortcut[];
  announcements: Announcement[];
}

const homepageRef = () => doc(getFirebaseDb(), "homepage", "content");

export const defaultHomepage: HomepageContent = {
  banners: heroSlides.map((s, i) => ({ ...s, imageUrl: heroImage(i) })),
  shortcuts: shortcuts.map((s) => ({ ...s, imageUrl: shortcutImage(s.label) })),
  announcements: announcements.map((a) => ({ id: a.id, text: a.text })),
};

export async function getHomepage(): Promise<HomepageContent> {
  const snap = await getDoc(homepageRef());
  if (!snap.exists()) return defaultHomepage;
  const data = snap.data() as Partial<HomepageContent>;
  return {
    banners: data.banners ?? defaultHomepage.banners,
    shortcuts: data.shortcuts ?? defaultHomepage.shortcuts,
    announcements: data.announcements ?? defaultHomepage.announcements,
  };
}

export async function saveHomepage(content: HomepageContent): Promise<void> {
  await setDoc(homepageRef(), { ...content, updatedAt: serverTimestamp() }, { merge: true });
}
