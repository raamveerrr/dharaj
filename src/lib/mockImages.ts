// Backend-ready mock imagery. Every consumer reads from these helpers so
// that swapping to real CDN URLs later is a one-line change.

const U = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

// Curated Unsplash photo IDs grouped by category. Kept small and organic-themed.
const POOLS: Record<string, string[]> = {
  ghee: [
    "1631452180519-c014fe946bc7",
    "1628088062854-d1870b4553da",
    "1590779033100-9f60a05a013d",
    "1567521464027-f127ff144326",
    "1550583724-b2692b85b150",
  ],
  pickles: [
    "1589135233689-a75f2c56cdca",
    "1601000938259-9e92002320b2",
    "1615485020471-b2f8e58ada2c",
    "1607330289024-1535c6b4e1c1",
    "1596040033229-1acf5a3fa19a",
  ],
  spices: [
    "1596040033229-a9821ebd058d",
    "1509358271058-acd22cc93898",
    "1532336414038-cf19250c5757",
    "1447279506476-3faec8071eee",
    "1596797038530-2c107229654b",
  ],
  cookies: [
    "1499636136210-6f4ee915583e",
    "1558961363-fa8fdf82db35",
    "1568827999250-3f6afff96e66",
    "1548365328-8c6db3220e4c",
    "1568051243858-533a607809a5",
  ],
  gulkand: [
    "1568564931647-cae6c9e21b74",
    "1502741224143-90386d7f8c82",
    "1563132337-f159f484226c",
    "1591086814583-9c0ea92c1e70",
    "1587049352846-4a222e784d38",
  ],
  "amla-candy": [
    "1615485500704-8e990f9900f7",
    "1591868304437-6d84ba63e069",
    "1615485020471-b2f8e58ada2c",
    "1550388342-b1b96b4d9d8d",
    "1587049352846-4a222e784d38",
  ],
  pulses: [
    "1596797038530-2c107229654b",
    "1610725664285-7c57e6eeac3f",
    "1585155770447-2f66e2a397b5",
    "1583224964978-2359bb9fac8b",
    "1615485020471-b2f8e58ada2c",
  ],
  snacks: [
    "1599490659213-e2b9527bd087",
    "1621939514649-280e2ee25f60",
    "1571091655789-405eb7a3a3a8",
    "1560717845-968823efbee1",
    "1621939514649-e79ea0d1af14",
  ],
};

const HERO_IMAGES = [
  U("1542838132-92c53300491e", 1400),
  U("1506617564039-2f3b650b7010", 1400),
  U("1543353071-873f17a7a088", 1400),
];

// Deterministic hash so images stay stable across renders.
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function productImages(productId: string, category: string, count = 5, w = 800): string[] {
  const pool = POOLS[category] ?? POOLS.ghee;
  const start = hash(productId) % pool.length;
  return Array.from({ length: count }, (_, i) => U(pool[(start + i) % pool.length], w));
}

export function categoryImage(slug: string, w = 800): string {
  const pool = POOLS[slug] ?? POOLS.ghee;
  return U(pool[0], w);
}

export function shortcutImage(seed: string, w = 400): string {
  // Use category pool if the seed matches a slug; otherwise round-robin.
  const slug = Object.keys(POOLS).find((k) => seed.toLowerCase().includes(k));
  const pool = slug ? POOLS[slug] : POOLS.ghee;
  return U(pool[hash(seed) % pool.length], w);
}

export function heroImage(index: number): string {
  return HERO_IMAGES[index % HERO_IMAGES.length];
}

// Placeholder review photos.
export function reviewPhoto(seed: string, w = 400): string {
  const all = Object.values(POOLS).flat();
  return U(all[hash(seed) % all.length], w);
}

// Avatar generator using DiceBear (works without account, always renders).
export function avatarUrl(name: string): string {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundType=gradientLinear`;
}
