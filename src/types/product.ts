export interface ProductImage {
  url: string;
  publicId: string;
}

export interface Product {

  // Firestore Document ID
  id: string;

  // Product Details
  name: string;
  slug: string;
  description: string;
  category: string;
  categoryId?: string;
  categoryName?: string;
  // Pricing
  price: number;
  mrp: number;
  discount: number;

  // Inventory
  stock: number;
  weight: string;
  sku: string;

  // Images (Maximum 5)
  images: ProductImage[];

  // Product Labels
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;

  // Ratings
  rating: number;
  reviewCount: number;

  // Visibility
  isActive: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}