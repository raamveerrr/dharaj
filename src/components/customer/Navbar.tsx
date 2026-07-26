import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X, ChevronDown, Leaf } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/stores/cart";
import { useWishlist } from "@/stores/wishlist";
import { categories, products } from "@/lib/data";
import { cn } from "@/lib/utils";

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
  const cartCount = useCart((s) => s.count());
  const wishCount = useWishlist((s) => s.ids.length);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdown, setDropdown] = useState<null | "cat" | "about" | "cust">(null);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        {/* Top row */}
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full lg:hidden hover:bg-secondary"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo />
          </div>
          <div className="hidden flex-1 lg:block">
            <SearchBar />
          </div>
          <div className="flex items-center gap-1">
            <Link
              to="/wishlist"
              className="relative hidden h-10 w-10 place-items-center rounded-full hover:bg-secondary sm:grid"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-sale px-1 text-[10px] font-bold text-primary-foreground">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-secondary"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-sale px-1 text-[10px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              to="/profile"
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary"
              aria-label="Profile"
            >
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Mobile search */}
        <div className="pb-3 lg:hidden">
          <SearchBar mobile />
        </div>

        {/* Secondary nav */}
        <nav className="hidden items-center gap-1 border-t border-border py-2 text-sm font-medium lg:flex">
          <Link to="/" className="rounded-full px-3 py-1.5 hover:bg-secondary" activeProps={{ className: "bg-secondary text-primary" }}>
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
                  {["100% Natural", "No Pesticides", "No Artificial Colour", "No Chemicals", "Handmade"].map(
                    (t) => (
                      <div key={t} className="rounded-xl px-3 py-2 text-sm hover:bg-secondary">
                        {t}
                      </div>
                    ),
                  )}
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

          <div className="ml-auto">
            <Link
              to="/admin"
              className="rounded-full border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Admin Panel
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-foreground/40"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.28 }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-background p-5 shadow-lift"
            >
              <div className="flex items-center justify-between">
                <Logo />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="mt-6 space-y-1">
                {[
                  ["Home", "/"],
                  ["Shop", "/shop"],
                  ["About", "/about"],
                  ["Wishlist", "/wishlist"],
                  ["Profile", "/profile"],
                  ["Admin Panel", "/admin"],
                ].map(([t, h]) => (
                  <Link
                    key={h}
                    to={h}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                  >
                    {t}
                  </Link>
                ))}
              </nav>
              <div className="mt-6">
                <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Categories
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      to="/category/$slug"
                      params={{ slug: c.slug }}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-xl bg-secondary/60 p-2.5"
                    >
                      <span className="text-lg">{c.icon}</span>
                      <span className="text-sm font-medium">{c.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
