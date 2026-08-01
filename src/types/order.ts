export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customer: string;
  email?: string;
  phone?: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: "Pending" | "Confirmed" | "Packed" | "Shipped" | "Delivered" | "Cancelled" | "Returned";
  createdAt?: Date;
  updatedAt?: Date;
}
