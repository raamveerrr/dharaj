export type PaymentStatus = "Awaiting Payment" | "Paid" | "Rejected";

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export const PAYMENT_STATUSES: PaymentStatus[] = ["Awaiting Payment", "Paid", "Rejected"];

export interface OrderItem {
  productId: string;
  productName: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  /** Firestore document id — same as the readable order number, e.g. DHJ-1001 */
  orderId: string;
  customerId: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  notes: string;

  items: OrderItem[];

  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;

  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  whatsappSent: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export type NewOrderInput = Omit<
  Order,
  "orderId" | "paymentStatus" | "orderStatus" | "whatsappSent" | "createdAt" | "updatedAt"
>;
