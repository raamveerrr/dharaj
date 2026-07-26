import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Grid3x3, Heart, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/stores/cart";
import { useWishlist } from "@/stores/wishlist";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/shop", label: "Shop", icon: Grid3x3 },
  { to: "/wishlist", label: "Wishlist", icon: Heart, badge: "wish" },
  { to: "/cart", label: "Cart", icon: ShoppingBag, badge: "cart" },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const cart = useCart((s) => s.count());
  const wish = useWishlist((s) => s.ids.length);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur lg:hidden">
      <ul className="mx-auto flex max-w-lg items-center justify-between px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        {items.map((it) => {
          const Icon = it.icon;
          const active = it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);
          const badge = it.badge === "cart" ? cart : it.badge === "wish" ? wish : 0;
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                className={cn(
                  "relative flex min-w-16 flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-full transition-all",
                    active && "bg-primary/10",
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                  {badge > 0 && (
                    <span className="absolute right-1 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-sale px-1 text-[10px] font-bold text-primary-foreground">
                      {badge}
                    </span>
                  )}
                </span>
                <span className={active ? "font-semibold" : ""}>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
