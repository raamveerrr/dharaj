// Local dummy JSON data. Structured to mirror a future Firestore schema so the
// UI can be wired to Firebase later without changing shapes.

export interface Category {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  icon: string; // lucide icon name or emoji fallback
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string; // category slug
  brand: string;
  weight: string;
  price: number;
  mrp: number;
  stock: number;
  sku: string;
  rating: number;
  reviewsCount: number;
  tags: string[];
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  images: number; // number of image placeholder slots (max 5)
}

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
}

export interface AnnouncementItem {
  id: string;
  text: string;
}

export interface Order {
  id: string;
  customer: string;
  status: "Pending" | "Confirmed" | "Packed" | "Shipped" | "Delivered" | "Cancelled" | "Returned";
  total: number;
  items: number;
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  joined: string;
  status: "active" | "inactive";
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount: number;
  type: "flat" | "percent";
  active: boolean;
  minOrder: number;
  expiry: string;
}

export const announcements: AnnouncementItem[] = [
  { id: "a1", text: "Free shipping on orders above ₹499" },
  { id: "a2", text: "Festive Sale — Flat 15% off with code DHARAJ15" },
  { id: "a3", text: "100% pure, handmade with love — no chemicals ever" },
];

export const categories: Category[] = [
  { id: "c1", slug: "ghee", name: "Desi Ghee", tagline: "Slow-churned purity", icon: "🧈" },
  { id: "c2", slug: "pickles", name: "Pickles", tagline: "Grandma's recipe", icon: "🥭" },
  { id: "c3", slug: "spices", name: "Spices", tagline: "Sun-dried, stone-ground", icon: "🌶️" },
  { id: "c4", slug: "cookies", name: "Cookies", tagline: "Baked with jaggery", icon: "🍪" },
  { id: "c5", slug: "gulkand", name: "Gulkand", tagline: "Rose petal preserve", icon: "🌹" },
  { id: "c6", slug: "amla-candy", name: "Amla Candy", tagline: "Immunity in a bite", icon: "🟢" },
  { id: "c7", slug: "pulses", name: "Pulses", tagline: "Farm fresh dals", icon: "🌾" },
  { id: "c8", slug: "snacks", name: "Healthy Snacks", tagline: "Guilt-free bites", icon: "🥜" },
];

export const heroSlides: HeroSlide[] = [
  {
    id: "h1",
    eyebrow: "New Harvest",
    title: "Pure A2 Desi Ghee",
    subtitle: "Hand-churned from grass-fed cows. Nothing added, nothing hidden.",
    cta: "Shop Ghee",
    href: "/category/ghee",
  },
  {
    id: "h2",
    eyebrow: "Grandma's Kitchen",
    title: "Sun-Aged Pickles",
    subtitle: "Traditional recipes, cold-pressed oils, real spice.",
    cta: "Explore Pickles",
    href: "/category/pickles",
  },
  {
    id: "h3",
    eyebrow: "Festival Sale",
    title: "Flat 15% Off Sitewide",
    subtitle: "Use code DHARAJ15 at checkout. Limited time only.",
    cta: "Shop the Sale",
    href: "/shop",
  },
];

const P = (
  id: string,
  name: string,
  category: string,
  price: number,
  mrp: number,
  weight: string,
  flags: Partial<Product> = {},
): Product => ({
  id,
  name,
  slug: id,
  category,
  brand: "Dharaj",
  weight,
  price,
  mrp,
  stock: 24,
  sku: `DHR-${id.toUpperCase()}`,
  // Deterministic (seeded by id) so server and client render identically.
  rating: Math.round((4.5 + (hashSeed(id) % 40) / 100) * 10) / 10,
  reviewsCount: 40 + (hashSeed(id + "r") % 200),
  tags: [category],
  images: 5,
  description:
    "Made in small batches using traditional methods. 100% natural, free of preservatives, colours and chemicals. Sourced directly from trusted organic farms.",
  ...flags,
});

export const products: Product[] = [
  P("a2-ghee-500", "A2 Cow Desi Ghee", "ghee", 899, 1099, "500 ml", { bestSeller: true, featured: true }),
  P("buffalo-ghee-1l", "Buffalo Ghee", "ghee", 749, 899, "1 L"),
  P("bilona-ghee", "Bilona Vedic Ghee", "ghee", 1299, 1499, "500 ml", { newArrival: true }),
  P("mango-pickle", "Homemade Mango Pickle", "pickles", 249, 320, "400 g", { bestSeller: true }),
  P("lemon-pickle", "Sweet Lemon Pickle", "pickles", 219, 280, "400 g"),
  P("garlic-pickle", "Green Chilli Garlic", "pickles", 199, 260, "300 g", { featured: true }),
  P("turmeric-powder", "Stone-ground Turmeric", "spices", 149, 199, "250 g", { bestSeller: true }),
  P("red-chilli", "Kashmiri Red Chilli", "spices", 189, 240, "250 g"),
  P("garam-masala", "Handpound Garam Masala", "spices", 219, 280, "200 g", { featured: true }),
  P("jaggery-cookies", "Jaggery Ragi Cookies", "cookies", 179, 220, "200 g", { newArrival: true }),
  P("ajwain-cookies", "Ajwain Salt Cookies", "cookies", 159, 199, "200 g"),
  P("gulkand-classic", "Classic Gulkand", "gulkand", 289, 349, "500 g", { featured: true }),
  P("amla-candy-sweet", "Sweet Amla Candy", "amla-candy", 199, 249, "250 g", { bestSeller: true }),
  P("amla-candy-salty", "Salty Amla Candy", "amla-candy", 199, 249, "250 g"),
  P("toor-dal", "Organic Toor Dal", "pulses", 189, 230, "1 kg"),
  P("moong-dal", "Split Moong Dal", "pulses", 179, 220, "1 kg", { newArrival: true }),
  P("chana-dal", "Chana Dal", "pulses", 149, 189, "1 kg"),
  P("roasted-makhana", "Roasted Makhana", "snacks", 249, 299, "100 g", { bestSeller: true }),
  P("mixed-nuts", "Trail Mix Nuts", "snacks", 449, 549, "250 g"),
  P("banana-chips", "Kerala Banana Chips", "snacks", 189, 229, "200 g"),
];

export const shortcuts = [
  { id: "s1", label: "Best Sellers", href: "/shop?filter=best" },
  { id: "s2", label: "Pure Ghee", href: "/category/ghee" },
  { id: "s3", label: "Pickles", href: "/category/pickles" },
  { id: "s4", label: "Spices", href: "/category/spices" },
  { id: "s5", label: "Cookies", href: "/category/cookies" },
  { id: "s6", label: "Snacks", href: "/category/snacks" },
  { id: "s7", label: "New Arrivals", href: "/shop?filter=new" },
  { id: "s8", label: "Shop All", href: "/shop" },
];

export const orders: Order[] = [
  { id: "ORD-1042", customer: "Aarav Sharma", status: "Delivered", total: 1249, items: 3, date: "2026-07-22" },
  { id: "ORD-1041", customer: "Priya Nair", status: "Shipped", total: 899, items: 2, date: "2026-07-23" },
  { id: "ORD-1040", customer: "Rohan Mehta", status: "Packed", total: 2199, items: 5, date: "2026-07-23" },
  { id: "ORD-1039", customer: "Ishita Rao", status: "Confirmed", total: 649, items: 2, date: "2026-07-24" },
  { id: "ORD-1038", customer: "Karan Singh", status: "Pending", total: 449, items: 1, date: "2026-07-24" },
  { id: "ORD-1037", customer: "Neha Gupta", status: "Delivered", total: 1799, items: 4, date: "2026-07-20" },
  { id: "ORD-1036", customer: "Vikas Patel", status: "Cancelled", total: 299, items: 1, date: "2026-07-19" },
  { id: "ORD-1035", customer: "Sneha Iyer", status: "Returned", total: 549, items: 2, date: "2026-07-18" },
];

export const customers: Customer[] = [
  { id: "u1", name: "Aarav Sharma", email: "aarav@example.com", phone: "+91 98111 22001", orders: 12, spent: 15400, joined: "2025-11-02", status: "active" },
  { id: "u2", name: "Priya Nair", email: "priya@example.com", phone: "+91 98111 22002", orders: 8, spent: 9800, joined: "2025-09-14", status: "active" },
  { id: "u3", name: "Rohan Mehta", email: "rohan@example.com", phone: "+91 98111 22003", orders: 22, spent: 32100, joined: "2025-05-30", status: "active" },
  { id: "u4", name: "Ishita Rao", email: "ishita@example.com", phone: "+91 98111 22004", orders: 3, spent: 2400, joined: "2026-03-11", status: "active" },
  { id: "u5", name: "Karan Singh", email: "karan@example.com", phone: "+91 98111 22005", orders: 1, spent: 449, joined: "2026-07-01", status: "inactive" },
];

export const coupons: Coupon[] = [
  { id: "cp1", code: "DHARAJ15", description: "Flat 15% off sitewide", discount: 15, type: "percent", active: true, minOrder: 499, expiry: "2026-12-31" },
  { id: "cp2", code: "FRESH100", description: "₹100 off first order", discount: 100, type: "flat", active: true, minOrder: 299, expiry: "2026-10-31" },
  { id: "cp3", code: "GHEELOVE", description: "10% off all ghee", discount: 10, type: "percent", active: false, minOrder: 799, expiry: "2026-09-15" },
];

export const reviews = [
  { id: "r1", user: "Aarav S.", rating: 5, text: "Ghee is incredibly aromatic. Reminds me of my grandmother's kitchen.", product: "A2 Cow Desi Ghee", date: "2 days ago" },
  { id: "r2", user: "Priya N.", rating: 5, text: "The pickle is exactly like homemade. Will order again.", product: "Homemade Mango Pickle", date: "1 week ago" },
  { id: "r3", user: "Rohan M.", rating: 4, text: "Masala is very fresh. Packaging could be better.", product: "Handpound Garam Masala", date: "2 weeks ago" },
];

export const salesSeries = [
  { day: "Mon", revenue: 12400, orders: 32 },
  { day: "Tue", revenue: 15800, orders: 41 },
  { day: "Wed", revenue: 14200, orders: 38 },
  { day: "Thu", revenue: 19200, orders: 52 },
  { day: "Fri", revenue: 22800, orders: 61 },
  { day: "Sat", revenue: 28500, orders: 74 },
  { day: "Sun", revenue: 24100, orders: 63 },
];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}
export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
export function getProductsByCategory(slug: string) {
  return products.filter((p) => p.category === slug);
}
