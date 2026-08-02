import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { OrderService } from "@/services/orderService";
import type { Order } from "@/types/order";

/** Admin: every order, kept live with a Firestore listener. */
export function useAllOrders(enabled = true) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["orders", "all"],
    queryFn: () => OrderService.listOrders(),
    enabled,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!enabled) return;
    const unsub = OrderService.subscribeOrders(
      (orders) => qc.setQueryData(["orders", "all"], orders),
      () => {},
    );
    return unsub;
  }, [enabled, qc]);

  return query;
}

/** Customer: only their own orders, kept live. */
export function useMyOrders(userId: string | undefined) {
  const qc = useQueryClient();
  const enabled = Boolean(userId);
  const query = useQuery({
    queryKey: ["orders", "user", userId ?? "anon"],
    queryFn: () => OrderService.listUserOrders(userId as string),
    enabled,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!userId) return;
    const unsub = OrderService.subscribeUserOrders(
      userId,
      (orders: Order[]) => qc.setQueryData(["orders", "user", userId], orders),
      () => {},
    );
    return unsub;
  }, [userId, qc]);

  return query;
}
