export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  name: string;
  productId: string;
  productName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  text: string;
  date: string;
  createdAt: Date;
  verified: boolean;
  helpful: number;
  status: ReviewStatus;
  variant?: string;
  photos?: string[];
}
