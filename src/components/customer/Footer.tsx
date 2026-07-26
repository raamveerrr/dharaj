import { Link } from "@tanstack/react-router";
import { Leaf, Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
                <Leaf className="h-5 w-5" />
              </span>
              <span className="text-xl font-extrabold tracking-tight text-primary">DHARAJ</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Pure. Handmade. Delivered fresh. A promise from our farms to your kitchen.
            </p>
            <div className="mt-4 flex gap-2">
              {[Instagram, Facebook, Twitter].map((I, i) => (
                <button
                  key={i}
                  aria-label="social"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-primary hover:text-primary-foreground"
                >
                  <I className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
          {[
            { t: "Shop", l: [["All Products", "/shop"], ["Ghee", "/category/ghee"], ["Pickles", "/category/pickles"], ["Spices", "/category/spices"]] },
            { t: "Customers", l: [["Track Order", "/profile"], ["Contact Us", "/about"], ["Return Policy", "/about"], ["Shipping", "/about"]] },
            { t: "Company", l: [["About Us", "/about"], ["Our Story", "/about"], ["Sustainability", "/about"], ["Admin", "/admin"]] },
          ].map((col) => (
            <div key={col.t}>
              <div className="text-sm font-semibold">{col.t}</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {col.l.map(([t, h]) => (
                  <li key={t}>
                    <Link to={h} className="hover:text-primary">
                      {t}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} Dharaj Organic. All rights reserved.</span>
          <span>Made with 🌿 in India</span>
        </div>
      </div>
    </footer>
  );
}
