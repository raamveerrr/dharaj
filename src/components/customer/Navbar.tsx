import { Link } from "@tanstack/react-router";
import { Search, X, ChevronDown, Leaf, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUI } from "@/stores/ui";
import { cn } from "@/lib/utils";
import { CategoryService } from "@/services/categoryService";
import { ProductService } from "@/services/productService";
import type { Product } from "@/types/product";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
        <Leaf className="h-5 w-5" />
      </span>
      <span className="text-xl font-extrabold tracking-tight text-primary">DHARAJ</span>
    </Link>
  );
}

function SearchBar({ mobile = false }: { mobile?: boolean }) {
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const data = await ProductService.getProducts();
      if (active) setProducts(data);
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const results = q
    ? products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : [];
  return (
    <div className={cn("relative w-full", mobile ? "" : "max-w-xl")}>
      <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search ghee, pickles, spices…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {q && (
          <button onClick={() => setQ("")} aria-label="Clear">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
      <AnimatePresence>
        {q && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-lift"
          >
            {results.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No matches for "{q}"</div>
            ) : (
              <ul className="divide-y divide-border">
                {results.map((r) => (
                  <li key={r.id}>
                    <Link
                      to="/product/$id"
                      params={{ id: r.id }}
                      onClick={() => setQ("")}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-secondary"
                    >
                      <span className="text-sm">{r.name}</span>
                      <span className="text-xs text-muted-foreground">{r.weight}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const openMobileMenu = useUI((s) => s.openMobileMenu);
  const [dropdown, setDropdown] = useState<null | "cat" | "about" | "cust">(null);
  const [categories, setCategories] = useState<Array<{ id: string; slug: string; name: string; tagline: string; icon: string }>>([]);

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
          tagline: category.description,
          icon: category.slug.includes("ghee") ? "🧈" : category.slug.includes("pickle") ? "🥭" : category.slug.includes("spice") ? "🌶️" : category.slug.includes("cookie") ? "🍪" : category.slug.includes("gulkand") ? "🌹" : category.slug.includes("amla") ? "🟢" : category.slug.includes("pulse") ? "🌾" : "🥜",
        })),
      );
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        {/* Top row */}
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <button
              onClick={openMobileMenu}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-secondary lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo />
          </div>
          <div className="hidden flex-1 lg:block">
            <SearchBar />
          </div>
        </div>

        {/* Mobile search */}
        <div className="pb-3 lg:hidden">
          <SearchBar mobile />
        </div>

        {/* Secondary desktop nav */}
        <nav className="hidden items-center gap-1 border-t border-border py-2 text-sm font-medium lg:flex">
          <Link
            to="/"
            className="rounded-full px-3 py-1.5 hover:bg-secondary"
            activeProps={{ className: "bg-secondary text-primary" }}
          >
            Home
          </Link>
          <div
            className="relative"
            onMouseEnter={() => setDropdown("cat")}
            onMouseLeave={() => setDropdown(null)}
          >
            <button className="flex items-center gap-1 rounded-full px-3 py-1.5 hover:bg-secondary">
              Shop by Category <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <AnimatePresence>
              {dropdown === "cat" && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute left-0 top-full z-40 mt-1 w-[520px] rounded-2xl border border-border bg-card p-4 shadow-lift"
                >
                  <div className="grid grid-cols-2 gap-1">
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        to="/category/$slug"
                        params={{ slug: c.slug }}
                        className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-secondary"
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-lg">
                          {c.icon}
                        </span>
                        <div>
                          <div className="text-sm font-semibold">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.tagline}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    to="/shop"
                    className="mt-3 flex items-center justify-center rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
                  >
                    Explore All Products
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div
            className="relative"
            onMouseEnter={() => setDropdown("about")}
            onMouseLeave={() => setDropdown(null)}
          >
            <button className="flex items-center gap-1 rounded-full px-3 py-1.5 hover:bg-secondary">
              About Us <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <AnimatePresence>
              {dropdown === "about" && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute left-0 top-full z-40 mt-1 w-64 rounded-2xl border border-border bg-card p-3 shadow-lift"
                >
                  {[
                    "100% Natural",
                    "No Pesticides",
                    "No Artificial Colour",
                    "No Chemicals",
                    "Handmade",
                  ].map((t) => (
                    <div key={t} className="rounded-xl px-3 py-2 text-sm hover:bg-secondary">
                      {t}
                    </div>
                  ))}
                  <Link
                    to="/about"
                    className="mt-2 block rounded-full bg-primary py-2 text-center text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
                  >
                    Know More
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div
            className="relative"
            onMouseEnter={() => setDropdown("cust")}
            onMouseLeave={() => setDropdown(null)}
          >
            <button className="flex items-center gap-1 rounded-full px-3 py-1.5 hover:bg-secondary">
              Customers <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <AnimatePresence>
              {dropdown === "cust" && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute left-0 top-full z-40 mt-1 w-56 rounded-2xl border border-border bg-card p-2 shadow-lift"
                >
                  {[
                    ["Track Order", "/profile"],
                    ["Contact Us", "/about"],
                    ["Return & Refund Policy", "/about"],
                    ["Shipping & Delivery Policy", "/about"],
                  ].map(([t, h]) => (
                    <Link
                      key={t}
                      to={h}
                      className="block rounded-xl px-3 py-2 text-sm hover:bg-secondary"
                    >
                      {t}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </div>
    </header>
  );
}
