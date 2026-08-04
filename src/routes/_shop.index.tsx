import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, ShieldCheck, Sprout, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { HeroSlider } from "@/components/customer/HeroSlider";
import { ShortcutCircle } from "@/components/customer/ShortcutCircle";
import { ProductCard } from "@/components/customer/ProductCard";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import { WhyDharaj } from "@/components/customer/WhyDharaj";
import { SocialFeed } from "@/components/customer/SocialFeed";
import { ProductService } from "@/services/productService";
import { CategoryService } from "@/services/categoryService";
import type { Product } from "@/types/product";

export const Route = createFileRoute("/_shop/")({
  loader: async () => ({
    products: await ProductService.getProducts(),
  }),
  head: () => ({
    meta: [
      { title: "DHARAJ — Pure Organic Grocery, Handmade with Love" },
      {
        name: "description",
        content:
          "Shop premium organic groceries — desi ghee, pickles, spices, cookies and natural food. 100% pure, no chemicals.",
      },
      { property: "og:title", content: "DHARAJ — Pure Organic Grocery" },
      {
        property: "og:description",
        content: "Handmade, natural and pure. Delivered fresh from farm to your kitchen.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { shortcuts, settings } = useHomepageContent();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; slug: string; name: string; tagline: string; image?: string }>>([]);

  useEffect(() => {
    const unsubscribeProducts = ProductService.subscribeProducts((nextProducts) => {
      setProducts(nextProducts);
    });
    const unsubscribeCategories = CategoryService.subscribeCategories((nextCategories) => {
      setCategories(nextCategories.map((category) => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
        tagline: category.description,
        image: category.image,
      })));
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, []);

  const bestSellers = products.filter((p) => p.bestSeller);
  return (
    <div className="mx-auto max-w-7xl space-y-14 px-4 py-6">
      <HeroSlider />

      {/* Shortcuts */}
      <section>
        <div className="hide-scrollbar -mx-4 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-4 sm:justify-center sm:gap-6">
          {shortcuts.map((s) => (
            <div key={s.id} className="snap-start shrink-0">
              <ShortcutCircle label={s.label} href={s.href} imageUrl={s.imageUrl} />
            </div>
          ))}
        </div>
      </section>

      {/* Value props */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { i: Leaf, t: "100% Natural" },
          { i: Sprout, t: "No Pesticides" },
          { i: ShieldCheck, t: "Lab Tested" },
          { i: Truck, t: "Fast Delivery" },
        ].map(({ i: Icon, t }) => (
          <div
            key={t}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold">{t}</span>
          </div>
        ))}
      </section>

      {/* Best sellers */}
      <Section title="Best Sellers" href="/shop">
        <Grid>
          {bestSellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Grid>
      </Section>

      {/* Category strip */}
      <section>
        <SectionHeader title="Shop by Category" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((c) => (
            <motion.div key={c.id} whileHover={{ y: -3 }}>
              <Link
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card hover:shadow-lift"
              >
                <ImagePlaceholder src={c.image || ""} alt={c.name} className="aspect-4/3 w-full" rounded="rounded-none" />
                <div className="p-3">
                  <div className="text-sm font-bold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.tagline}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <WhyDharaj section={settings.why} />

      <SocialFeed section={settings.social} />
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-extrabold sm:text-2xl">{title}</h2>
      {href && (
        <Link
          to={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function Section({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <section>
      <SectionHeader title={title} href={href} />
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">{children}</div>;
}
