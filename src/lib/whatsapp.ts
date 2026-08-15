import { inr } from "@/lib/format";
import type { Order } from "@/types/order";

/** Store WhatsApp number in international format without "+" (e.g. 919983363435). */
export const WHATSAPP_NUMBER: string =
  (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined)?.replace(/\D/g, "") || "919799007576";

export function buildWhatsappMessage(order: Order): string {
  const addressLines = [
    order.address,
    [order.city, order.state, order.pincode].filter(Boolean).join(", "),
    order.landmark ? `Landmark: ${order.landmark}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const products = order.items
    .map(
      (it, i) =>
        `${i + 1}. ${it.productName}\n   Qty: ${it.quantity}\n   Price: ${inr(it.price)}\n   Subtotal: ${inr(it.subtotal)}`,
    )
    .join("\n");

  return [
    "Hello DHARAJ,",
    "",
    "I want to place an order.",
    "",
    `Order ID: ${order.orderId}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    "",
    "Address:",
    addressLines,
    order.notes ? `\nNotes: ${order.notes}` : "",
    "",
    "Products",
    products,
    "",
    `Subtotal: ${inr(order.subtotal)}`,
    `Delivery: ${order.deliveryCharge === 0 ? "Free" : inr(order.deliveryCharge)}`,
    `Discount: ${order.discount > 0 ? `- ${inr(order.discount)}` : inr(0)}`,
    `Grand Total: ${inr(order.total)}`,
    "",
    `Payment Status: ${order.paymentStatus}`,
    "",
    "Please send me your payment QR Code.",
  ]
    .filter((l) => l !== undefined)
    .join("\n");
}

export function whatsappOrderUrl(order: Order): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsappMessage(order))}`;
}

/** Plain-text receipt shown to the customer (no PDF). */
export function buildReceipt(order: Order): string {
  const lines = order.items.map((it) => `${it.productName} x${it.quantity}    ${inr(it.subtotal)}`);
  return [
    "-----------------------",
    "DHARAJ",
    "Order Receipt",
    "",
    `Order ID: ${order.orderId}`,
    `Date: ${order.createdAt ? order.createdAt.toLocaleString("en-IN") : "—"}`,
    `Customer: ${order.customerName}`,
    "",
    "Products",
    ...lines,
    "",
    `Subtotal: ${inr(order.subtotal)}`,
    `Delivery: ${order.deliveryCharge === 0 ? "Free" : inr(order.deliveryCharge)}`,
    order.discount > 0 ? `Discount: - ${inr(order.discount)}` : "",
    `Total: ${inr(order.total)}`,
    "",
    `Payment: ${order.paymentStatus}`,
    `Order Status: ${order.orderStatus}`,
    "",
    "Thank you for shopping with DHARAJ.",
    "-----------------------",
  ]
    .filter((l) => l !== "")
    .join("\n");
}
