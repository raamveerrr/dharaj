export interface CustomerReview {
  id: string;
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  text: string;
  date: string;
  verified: boolean;
  helpful: number;
  variant?: string;
  photos?: string[]; // photo seeds; resolved via mockImages
}

export const mockReviews: CustomerReview[] = [
  {
    id: "rv1",
    name: "Aarav Sharma",
    rating: 5,
    title: "Tastes exactly like my grandmother's ghee",
    text: "The aroma the moment I opened the jar was unreal. Slow-churned quality is unmistakable. This is our household staple now.",
    date: "2 days ago",
    verified: true,
    helpful: 42,
    variant: "500 ml",
    photos: ["rv1a", "rv1b"],
  },
  {
    id: "rv2",
    name: "Priya Nair",
    rating: 5,
    title: "Authentic homemade flavour",
    text: "Reminded me of my mother's kitchen in Kerala. Perfectly spiced, oil ratio is spot on. Will absolutely reorder.",
    date: "5 days ago",
    verified: true,
    helpful: 31,
    variant: "400 g",
    photos: ["rv2a"],
  },
  {
    id: "rv3",
    name: "Rohan Mehta",
    rating: 4,
    title: "Fresh and aromatic",
    text: "Spices are clearly stone-ground and very fresh. Deducted one star because the label could be sturdier.",
    date: "1 week ago",
    verified: true,
    helpful: 18,
    variant: "250 g",
  },
  {
    id: "rv4",
    name: "Ishita Rao",
    rating: 5,
    title: "Worth every rupee",
    text: "Premium quality across the board. Packaging is beautiful, product is genuine. Highly recommended for anyone who values purity.",
    date: "2 weeks ago",
    verified: true,
    helpful: 27,
    photos: ["rv4a", "rv4b", "rv4c"],
  },
  {
    id: "rv5",
    name: "Karan Singh",
    rating: 4,
    title: "Great taste, quick delivery",
    text: "Order arrived in 3 days, well-packed. Taste is excellent. Would love a larger pack size option.",
    date: "3 weeks ago",
    verified: true,
    helpful: 14,
  },
  {
    id: "rv6",
    name: "Neha Gupta",
    rating: 5,
    title: "Finally a brand I can trust",
    text: "As a mother of two, I'm very particular about what enters our kitchen. Dharaj has been consistently pure and honest.",
    date: "1 month ago",
    verified: true,
    helpful: 63,
    photos: ["rv6a"],
  },
  {
    id: "rv7",
    name: "Vikas Patel",
    rating: 3,
    title: "Good but pricey",
    text: "Quality is there, no doubt. Slightly on the expensive side compared to local shops, but the sourcing story convinced me.",
    date: "1 month ago",
    verified: false,
    helpful: 8,
  },
  {
    id: "rv8",
    name: "Sneha Iyer",
    rating: 5,
    title: "Old school goodness in modern packaging",
    text: "Tastes exactly like what my grandmother used to make. My kids finished the jar in a week!",
    date: "5 weeks ago",
    verified: true,
    helpful: 21,
    photos: ["rv8a", "rv8b"],
  },
  {
    id: "rv9",
    name: "Manish Kumar",
    rating: 4,
    title: "Very good product",
    text: "Rich, aromatic and clearly natural. Would recommend to friends and family.",
    date: "2 months ago",
    verified: true,
    helpful: 11,
  },
  {
    id: "rv10",
    name: "Ananya Desai",
    rating: 5,
    title: "Loved it, ordering again",
    text: "Everything about this order felt premium — the box, the jar, and most importantly the taste. Bravo Dharaj!",
    date: "2 months ago",
    verified: true,
    helpful: 36,
    photos: ["rv10a"],
  },
];

export function ratingSummary(reviews: CustomerReview[]) {
  const total = reviews.length;
  const dist: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of reviews) {
    dist[r.rating]++;
    sum += r.rating;
  }
  return { total, average: total ? sum / total : 0, dist };
}
