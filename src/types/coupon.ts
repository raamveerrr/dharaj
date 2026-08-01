export type CouponType = "percent" | "fixed";

export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: CouponType;
  discount: number;
  minOrder: number;
  maxDiscount?: number;
  expiry: string;
  active: boolean;
  usageLimit?: number;
  usedCount?: number;
  singleUse?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
