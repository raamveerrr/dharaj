import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Leaf, X } from "lucide-react";
import { useUI } from "@/stores/ui";
import { cn } from "@/lib/utils";
import { CategoryService } from "@/services/categoryService";

const aboutItems = [
  "100% Natural",
  "No Pesticides",
  "No Artificial Colour",
  "No Chemicals",
  "Handmade",
];

const customerItems: Array<[string, string]> = [
  ["Track Order", "/profile"],
  ["Contact Us", "/about"],
  ["Shipping Policy", "/about"],
  ["Return & Refund Policy", "/about"],
];

export function MobileDrawer() {
  const isOpen = useUI((s) => s.isMobileMenuOpen);
  const close = useUI((s) => s.closeMobileMenu);
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState<null | "shop" | "about" | "customers">("shop");
  const [categories, setCategories] = useState<Array<{ id: string; slug: string; name: string; icon: string }>>([]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const list = await CategoryService.getCategories();
      if (!active) return;
      setCategories(
        list.map((category) => ({
          id: category.id,
          slug: category.slug,
          name: category.name,
          icon: category.slug.includes("ghee") ? "🧈" : category.slug.includes("pickle") ? "🥭" : category.slug.includes("spice") ? "🌶️" : category.slug.includes("cookie") ? "🍪" : category.slug.includes("gulkand") ? "🌹" : category.slug.includes("amla") ? "🟢" : category.slug.includes("pulse") ? "🌾" : "🥜",
        })),
      );
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  if (!mounted) return null;

  const toggle = (k: "shop" | "about" | "customers") =>
    setExpanded((cur) => (cur === k ? null : k));

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", ease: [0.32, 0.72, 0, 1], duration: 0.28 }}
            className="absolute inset-y-0 left-0 flex h-dvh w-[85vw] max-w-sm flex-col bg-background shadow-lift"
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Link to="/" onClick={close} className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Leaf className="h-5 w-5" />
                </span>
                <span className="text-xl font-extrabold tracking-tight text-primary">
                  DHARAJ
                </span>
              </Link>
              <button
                onClick={close}
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
              <SimpleLink to="/" onClose={close} label="Home" />

              {/* Shop accordion */}
              <Accordion
                label="Shop"
                open={expanded === "shop"}
                onToggle={() => toggle("shop")}
              >
                <div className="grid grid-cols-2 gap-2 px-2 pt-1">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      to="/category/$slug"
                      params={{ slug: c.slug }}
                      onClick={close}
                      className="flex items-center gap-2 rounded-xl bg-secondary/60 p-2.5"
                    >
                      <span className="text-lg">{c.icon}</span>
                      <span className="text-sm font-medium">{c.name}</span>
                    </Link>
                  ))}
                </div>
                <Link
                  to="/shop"
                  onClick={close}
                  className="mx-2 mt-3 block rounded-full bg-primary py-2.5 text-center text-sm font-bold text-primary-foreground hover:bg-primary-hover"
                >
                  Explore All Products
                </Link>
              </Accordion>

              {/* About accordion */}
              <Accordion
                label="About Us"
                open={expanded === "about"}
                onToggle={() => toggle("about")}
              >
                <ul className="space-y-1 px-2 pt-1">
                  {aboutItems.map((t) => (
                    <li
                      key={t}
                      className="rounded-xl px-3 py-2 text-sm text-muted-foreground"
                    >
                      • {t}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/about"
                  onClick={close}
                  className="mx-2 mt-3 block rounded-full border border-primary/30 py-2.5 text-center text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Know More
                </Link>
              </Accordion>

              {/* Customers accordion */}
              <Accordion
                label="Customers"
                open={expanded === "customers"}
                onToggle={() => toggle("customers")}
              >
                <ul className="space-y-1 px-2 pt-1">
                  {customerItems.map(([t, h]) => (
                    <li key={t}>
                      <Link
                        to={h}
                        onClick={close}
                        className="block rounded-xl px-3 py-2 text-sm hover:bg-secondary"
                      >
                        {t}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Accordion>

              <SimpleLink to="/profile" onClose={close} label="Profile" />
            </div>

            <div className="border-t border-border px-5 py-3 text-center text-xs text-muted-foreground">
              © DHARAJ · Premium Organic Grocery
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function SimpleLink({
  to,
  label,
  onClose,
}: {
  to: string;
  label: string;
  onClose: () => void;
}) {
  return (
    <Link
      to={to as any}
      onClick={onClose}
      className="flex items-center rounded-xl px-4 py-3 text-[15px] font-semibold hover:bg-secondary"
    >
      {label}
    </Link>
  );
}

function Accordion({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl">
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-4 py-3 text-[15px] font-semibold hover:bg-secondary",
          open && "bg-secondary/60",
        )}
        aria-expanded={open}
      >
        <span>{label}</span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden pb-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
