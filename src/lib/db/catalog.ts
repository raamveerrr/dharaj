import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ProductService } from "@/services/productService";
import { CategoryService } from "@/services/categoryService";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

const defaultImage = (category: string) => `https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80`;

function productImages(category: string, count = 5) {
  return Array.from({ length: count }, (_, index) => `${defaultImage(category)}&sig=${category}-${index}`);
}

const seedProducts: Array<{
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  mrp: number;
  weight: string;
  stock: number;
  sku: string;
  bestSeller?: boolean;
  featured?: boolean;
  newArrival?: boolean;
}> = [
  {
    id: "a2-ghee-500",
    name: "A2 Cow Desi Ghee",
    category: "ghee",
    description: "Pure desi ghee with rich aroma and traditional taste.",
    price: 899,
    mrp: 1099,
    weight: "500 ml",
    stock: 18,
    sku: "GHEE-500-A2",
    bestSeller: true,
    featured: true,
  },
  {
    id: "buffalo-ghee-1l",
    name: "Buffalo Ghee",
    category: "ghee",
    description: "Creamy buffalo ghee for daily cooking and festive meals.",
    price: 749,
    mrp: 899,
    weight: "1 L",
    stock: 12,
    sku: "GHEE-1000-BF",
  },
  {
    id: "bilona-ghee",
    name: "Bilona Vedic Ghee",
    category: "ghee",
    description: "Slow-churned bilona ghee made with authentic craftsmanship.",
    price: 1299,
    mrp: 1499,
    weight: "500 ml",
    stock: 10,
    sku: "GHEE-500-BV",
    newArrival: true,
  },
  {
    id: "mango-pickle",
    name: "Homemade Mango Pickle",
    category: "pickles",
    description: "Traditional homemade mango pickle with bold spice and tang.",
    price: 249,
    mrp: 320,
    weight: "400 g",
    stock: 20,
    sku: "PICKLE-MANGO-400",
    bestSeller: true,
  },
  {
    id: "lemon-pickle",
    name: "Sweet Lemon Pickle",
    category: "pickles",
    description: "A sweet-and-sour lemon pickle made for everyday bites.",
    price: 219,
    mrp: 280,
    weight: "400 g",
    stock: 16,
    sku: "PICKLE-LEMON-400",
  },
  {
    id: "garlic-pickle",
    name: "Green Chilli Garlic",
    category: "pickles",
    description: "Zesty green chilli and garlic pickle with a homemade finish.",
    price: 199,
    mrp: 260,
    weight: "300 g",
    stock: 14,
    sku: "PICKLE-GARLIC-300",
    featured: true,
  },
  {
    id: "turmeric-powder",
    name: "Stone-ground Turmeric",
    category: "spices",
    description: "Finely ground turmeric with a warm golden aroma.",
    price: 149,
    mrp: 199,
    weight: "250 g",
    stock: 24,
    sku: "SPICE-TURMERIC-250",
    bestSeller: true,
  },
  {
    id: "red-chilli",
    name: "Kashmiri Red Chilli",
    category: "spices",
    description: "Bright, smooth chilli powder for rich, vibrant curries.",
    price: 189,
    mrp: 240,
    weight: "250 g",
    stock: 22,
    sku: "SPICE-CHILLI-250",
  },
  {
    id: "garam-masala",
    name: "Handpound Garam Masala",
    category: "spices",
    description: "Classic garam masala with balanced, aromatic spice notes.",
    price: 219,
    mrp: 280,
    weight: "200 g",
    stock: 19,
    sku: "SPICE-GARAM-200",
    featured: true,
  },
  {
    id: "jaggery-cookies",
    name: "Jaggery Ragi Cookies",
    category: "cookies",
    description: "Crunchy cookies sweetened with jaggery and crafted with ragi.",
    price: 179,
    mrp: 220,
    weight: "200 g",
    stock: 13,
    sku: "COOKIE-JAGGERY-200",
    newArrival: true,
  },
  {
    id: "ajwain-cookies",
    name: "Ajwain Salt Cookies",
    category: "cookies",
    description: "Savory ajwain cookies with a crisp, pantry-friendly bite.",
    price: 159,
    mrp: 199,
    weight: "200 g",
    stock: 11,
    sku: "COOKIE-AJWAIN-200",
  },
  {
    id: "gulkand-classic",
    name: "Classic Gulkand",
    category: "gulkand",
    description: "A fragrant rose petal confection with classic floral sweetness.",
    price: 289,
    mrp: 349,
    weight: "500 g",
    stock: 9,
    sku: "GULKAND-CLASSIC-500",
    featured: true,
  },
  {
    id: "amla-candy-sweet",
    name: "Sweet Amla Candy",
    category: "amla-candy",
    description: "Mild sweet amla candy with a clean, tangy finish.",
    price: 199,
    mrp: 249,
    weight: "250 g",
    stock: 15,
    sku: "AMLA-SWEET-250",
    bestSeller: true,
  },
  {
    id: "amla-candy-salty",
    name: "Salty Amla Candy",
    category: "amla-candy",
    description: "Salty amla candy with a brisk, palate-cleansing profile.",
    price: 199,
    mrp: 249,
    weight: "250 g",
    stock: 15,
    sku: "AMLA-SALTY-250",
  },
  {
    id: "toor-dal",
    name: "Organic Toor Dal",
    category: "pulses",
    description: "Premium split toor dal for classic homemade meals.",
    price: 189,
    mrp: 230,
    weight: "1 kg",
    stock: 21,
    sku: "PULSE-TOOR-1000",
  },
  {
    id: "moong-dal",
    name: "Split Moong Dal",
    category: "pulses",
    description: "Soft and wholesome moong dal for soups and khichdi.",
    price: 179,
    mrp: 220,
    weight: "1 kg",
    stock: 17,
    sku: "PULSE-MOONG-1000",
    newArrival: true,
  },
  {
    id: "chana-dal",
    name: "Chana Dal",
    category: "pulses",
    description: "Nutritious chana dal with dependable texture and flavor.",
    price: 149,
    mrp: 189,
    weight: "1 kg",
    stock: 23,
    sku: "PULSE-CHANA-1000",
  },
  {
    id: "roasted-makhana",
    name: "Roasted Makhana",
    category: "snacks",
    description: "Crisp roasted makhana for light, healthy snacking.",
    price: 249,
    mrp: 299,
    weight: "100 g",
    stock: 12,
    sku: "SNACK-MAKHANA-100",
    bestSeller: true,
  },
  {
    id: "mixed-nuts",
    name: "Trail Mix Nuts",
    category: "snacks",
    description: "A ready-to-munch trail mix of nuts, seeds, and dried fruit.",
    price: 449,
    mrp: 549,
    weight: "250 g",
    stock: 8,
    sku: "SNACK-NUTS-250",
  },
  {
    id: "banana-chips",
    name: "Kerala Banana Chips",
    category: "snacks",
    description: "Thin, seasoning-rich Kerala banana chips with a crisp finish.",
    price: 189,
    mrp: 229,
    weight: "200 g",
    stock: 10,
    sku: "SNACK-BANANA-200",
  },
];

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
      imageUrls: productImages(p.category, 5),
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
  imagePublicId?: string;
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

export interface WhyItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  badge?: string;
}

export interface WhySection {
  enabled: boolean;
  heading: string;
  subheading: string;
  items: WhyItem[];
}

export interface SocialItem {
  id: string;
  imageUrl: string;
  caption: string;
  handle: string;
  href: string;
}

export interface SocialSection {
  enabled: boolean;
  heading: string;
  subheading: string;
  items: SocialItem[];
}

export interface HomepageSettings {
  shortcuts: Shortcut[];
  featuredProductsHeading?: string;
  featuredCategoriesHeading?: string;
  why?: WhySection;
  social?: SocialSection;
  [key: string]: unknown;
}

export interface HomepageContent {
  banners: Banner[];
  shortcuts: Shortcut[];
  announcements: Announcement[];
  featuredProducts: Product[];
  featuredCategories: Category[];
  settings: HomepageSettings;
}

export const defaultWhySection: WhySection = {
  enabled: true,
  heading: "Why DHARAJ",
  subheading: "Pure, traditional and honestly made — here is what sets us apart.",
  items: [],
};

export const defaultSocialSection: SocialSection = {
  enabled: true,
  heading: "Join Us on Instagram",
  subheading: "Tap, shop, and explore authentic stories from our customers and creators.",
  items: [],
};

const emptyHomepage: HomepageContent = {
  banners: [],
  shortcuts: [],
  announcements: [],
  featuredProducts: [],
  featuredCategories: [],
  settings: {
    shortcuts: [],
    featuredProductsHeading: "Featured products",
    featuredCategoriesHeading: "Shop by category",
    why: defaultWhySection,
    social: defaultSocialSection,
  },
};


const heroCollection = () => collection(getFirebaseDb(), "homepageHero");
const announcementCollection = () => collection(getFirebaseDb(), "homepageAnnouncements");
const settingsDoc = () => doc(getFirebaseDb(), "homepageSettings", "settings");
const featuredProductsCollection = () => collection(getFirebaseDb(), "featuredProducts");
const featuredCategoriesCollection = () => collection(getFirebaseDb(), "featuredCategories");

export async function getHomepage(): Promise<HomepageContent> {
  try {
    const [heroSnap, announcementSnap, settingsSnap, featuredProductsSnap, featuredCategoriesSnap] = await Promise.all([
      getDocs(query(heroCollection(), orderBy("order", "asc"))),
      getDocs(query(announcementCollection(), orderBy("order", "asc"))),
      getDoc(settingsDoc()),
      getDocs(query(featuredProductsCollection(), orderBy("order", "asc"))),
      getDocs(query(featuredCategoriesCollection(), orderBy("order", "asc"))),
    ]);

    const banners = heroSnap.docs.map((doc) => ({ ...(doc.data() as Banner), id: doc.id }));
    const announcements = announcementSnap.docs.map((doc) => ({ ...(doc.data() as Announcement), id: doc.id }));
    const settingsData = (settingsSnap.exists() ? (settingsSnap.data() as Record<string, unknown>) : {}) ?? {};
    const shortcuts = Array.isArray(settingsData.shortcuts) ? settingsData.shortcuts as Shortcut[] : [];

    const featuredProductIds = featuredProductsSnap.docs.map((doc) => String((doc.data() as Record<string, unknown>).productId ?? "")).filter(Boolean);
    const featuredCategoryIds = featuredCategoriesSnap.docs
      .map((doc) => String((doc.data() as Record<string, unknown>).categoryId ?? ""))
      .filter(Boolean);

    const featuredProducts = featuredProductIds.length ? await ProductService.getProductsByIds(featuredProductIds) : [];
    const featuredCategories = featuredCategoryIds.length ? await CategoryService.getCategoriesByIds(featuredCategoryIds) : [];

    return {
      banners,
      shortcuts,
      announcements,
      featuredProducts,
      featuredCategories,
      settings: {
        ...settingsData,
        shortcuts,
      } as HomepageSettings,
    };
  } catch (error) {
    console.warn("Failed to load homepage content", error);
    return emptyHomepage;
  }
}

export async function saveHomepage(content: HomepageContent): Promise<void> {
  const db = getFirebaseDb();
  const batch = writeBatch(db);

  const existingHero = await getDocs(heroCollection());
  existingHero.docs.forEach((doc) => batch.delete(doc.ref));
  content.banners.forEach((banner, index) => {
    batch.set(doc(heroCollection(), banner.id), { ...banner, order: index });
  });

  const existingAnnouncements = await getDocs(announcementCollection());
  existingAnnouncements.docs.forEach((doc) => batch.delete(doc.ref));
  content.announcements.forEach((announcement, index) => {
    batch.set(doc(announcementCollection(), announcement.id), { ...announcement, order: index });
  });

  const existingFeaturedProducts = await getDocs(featuredProductsCollection());
  existingFeaturedProducts.docs.forEach((doc) => batch.delete(doc.ref));
  content.featuredProducts.forEach((product, index) => {
    const ref = product.id ? doc(featuredProductsCollection(), product.id) : doc(featuredProductsCollection());
    batch.set(ref, { productId: product.id, order: index });
  });

  const existingFeaturedCategories = await getDocs(featuredCategoriesCollection());
  existingFeaturedCategories.docs.forEach((doc) => batch.delete(doc.ref));
  content.featuredCategories.forEach((category, index) => {
    const ref = category.id ? doc(featuredCategoriesCollection(), category.id) : doc(featuredCategoriesCollection());
    batch.set(ref, { categoryId: category.id, order: index });
  });

  batch.set(
    settingsDoc(),
    {
      shortcuts: Array.isArray(content.shortcuts) ? content.shortcuts : [],
      featuredProductsHeading: content.settings?.featuredProductsHeading ?? "Featured products",
      featuredCategoriesHeading: content.settings?.featuredCategoriesHeading ?? "Shop by category",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await batch.commit();
}
