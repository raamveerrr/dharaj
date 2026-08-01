export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: "percent" | "fixed";
  discount: number;
  minOrder: number;
  expiry: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
