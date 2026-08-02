export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  isActive: boolean;
  featured: boolean;
  order: number;
}