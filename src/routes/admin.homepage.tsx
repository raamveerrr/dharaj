import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Save, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import { ProductImageUploader } from "@/components/admin/ProductImageUploader";
import { CloudinaryService } from "@/services/cloudinaryService";
import { ProductService } from "@/services/productService";
import { CategoryService } from "@/services/categoryService";
import {
  getHomepage,
  saveHomepage,
  type HomepageContent,
  type Banner,
  type Shortcut,
  type WhyItem,
  type SocialItem,
  defaultWhySection,
  defaultSocialSection,
} from "@/lib/db/catalog";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

export const Route = createFileRoute("/admin/homepage")({
  head: () => ({ meta: [{ title: "Homepage — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminHomepage,
});

const uid = () => Math.random().toString(36).slice(2, 9);

function AdminHomepage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["homepage"], queryFn: getHomepage });
  const [draft, setDraft] = useState<HomepageContent | null>(null);
  const [bannerFiles, setBannerFiles] = useState<Record<string, File | null>>({});
  const [shortcutFiles, setShortcutFiles] = useState<Record<string, File | null>>({});
  const [whyFiles, setWhyFiles] = useState<Record<string, File | null>>({});
  const [socialFiles, setSocialFiles] = useState<Record<string, File | null>>({});
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  useEffect(() => {
    if (data && !draft) setDraft(data);
  }, [data, draft]);

  useEffect(() => {
    const loadSelectors = async () => {
      const [products, categories] = await Promise.all([
        ProductService.getProducts(),
        CategoryService.getCategories(),
      ]);
      setAvailableProducts(products);
      setAvailableCategories(categories);
    };

    void loadSelectors();
  }, []);

  const save = useMutation({
    mutationFn: async (content: HomepageContent) => {
      const uploadedBanners = await Promise.all(
        content.banners.map(async (banner) => {
          const pendingFile = bannerFiles[banner.id];
          if (!pendingFile) return banner;
          const uploaded = await CloudinaryService.uploadImage(pendingFile, "banners", {
            width: 1600,
            height: 900,
            crop: "fill",
            gravity: "auto",
          });
          return { ...banner, imageUrl: uploaded.url };
        }),
      );
      const uploadedShortcuts = await Promise.all(
        content.shortcuts.map(async (shortcut) => {
          const pendingFile = shortcutFiles[shortcut.id];
          if (!pendingFile) return shortcut;
          const uploaded = await CloudinaryService.uploadImage(pendingFile, "shortcuts", {
            width: 400,
            height: 400,
            crop: "fill",
            gravity: "auto",
          });
          return { ...shortcut, imageUrl: uploaded.url };
        }),
      );

      const why = content.settings.why ?? defaultWhySection;
      const social = content.settings.social ?? defaultSocialSection;

      const uploadedWhyItems = await Promise.all(
        why.items.map(async (item) => {
          const pendingFile = whyFiles[item.id];
          if (!pendingFile) return item;
          const uploaded = await CloudinaryService.uploadImage(pendingFile, "why-dharaj", {
            width: 1200,
            height: 900,
            crop: "fill",
            gravity: "auto",
          });
          return { ...item, imageUrl: uploaded.url };
        }),
      );

      const uploadedSocialItems = await Promise.all(
        social.items.map(async (item) => {
          const pendingFile = socialFiles[item.id];
          if (!pendingFile) return item;
          const uploaded = await CloudinaryService.uploadImage(pendingFile, "social-feed", {
            width: 720,
            height: 1280,
            crop: "fill",
            gravity: "auto",
          });
          return { ...item, imageUrl: uploaded.url };
        }),
      );

      return saveHomepage({
        ...content,
        banners: uploadedBanners,
        shortcuts: uploadedShortcuts,
        settings: {
          ...content.settings,
          why: { ...why, items: uploadedWhyItems },
          social: { ...social, items: uploadedSocialItems },
        },
      });
    },
    onSuccess: () => {
      toast.success("Homepage saved");
      qc.invalidateQueries({ queryKey: ["homepage"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not save"),
  });

  const fallbackHomepage: HomepageContent = {
    banners: [],
    shortcuts: [],
    announcements: [],
    featuredProducts: [],
    featuredCategories: [],
    settings: {
      shortcuts: [],
      featuredProductsHeading: "Featured products",
      featuredCategoriesHeading: "Shop by category",
      why: defaultWhySection,
      social: defaultSocialSection,
    },
  };

  const pageLoading = isLoading || !draft;
  const currentDraft = draft ?? fallbackHomepage;

  const patch = (p: Partial<HomepageContent>) => setDraft({ ...(draft ?? fallbackHomepage), ...p });
  const patchSettings = (p: Partial<HomepageContent["settings"]>) =>
    setDraft({ ...(draft ?? fallbackHomepage), settings: { ...(draft ?? fallbackHomepage).settings, ...p } });

  const why = currentDraft.settings.why ?? defaultWhySection;
  const social = currentDraft.settings.social ?? defaultSocialSection;
  const patchWhy = (p: Partial<typeof why>) => patchSettings({ why: { ...why, ...p } });
  const patchSocial = (p: Partial<typeof social>) => patchSettings({ social: { ...social, ...p } });
  const setWhyItem = (i: number, p: Partial<WhyItem>) =>
    patchWhy({ items: why.items.map((x, idx) => (idx === i ? { ...x, ...p } : x)) });
  const setSocialItem = (i: number, p: Partial<SocialItem>) =>
    patchSocial({ items: social.items.map((x, idx) => (idx === i ? { ...x, ...p } : x)) });

  const moveItem = <T extends unknown>(items: T[], index: number, direction: number) => {
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(index + direction, 0, item);
    return next;
  };

  const moveBanner = (index: number, direction: number) =>
    patch({ banners: moveItem(currentDraft.banners, index, direction) });

  const moveAnnouncement = (index: number, direction: number) =>
    patch({ announcements: moveItem(currentDraft.announcements, index, direction) });

  const moveFeaturedProduct = (index: number, direction: number) =>
    patch({ featuredProducts: moveItem(currentDraft.featuredProducts, index, direction) });

  const moveFeaturedCategory = (index: number, direction: number) =>
    patch({ featuredCategories: moveItem(currentDraft.featuredCategories, index, direction) });

  const setBanner = (i: number, b: Partial<Banner>) =>
    patch({ banners: currentDraft.banners.map((x, idx) => (idx === i ? { ...x, ...b } : x)) });

  const setShortcut = (i: number, s: Partial<Shortcut>) =>
    patch({ shortcuts: currentDraft.shortcuts.map((x, idx) => (idx === i ? { ...x, ...s } : x)) });

  const toggleFeaturedProduct = (product: Product) => {
    const selectedIds = new Set(currentDraft.featuredProducts.map((item) => item.id));
    if (selectedIds.has(product.id)) {
      patch({ featuredProducts: currentDraft.featuredProducts.filter((item) => item.id !== product.id) });
      return;
    }
    patch({ featuredProducts: [...currentDraft.featuredProducts, product] });
  };

  const toggleFeaturedCategory = (category: Category) => {
    const selectedIds = new Set(currentDraft.featuredCategories.map((item) => item.id));
    if (selectedIds.has(category.id)) {
      patch({ featuredCategories: currentDraft.featuredCategories.filter((item) => item.id !== category.id) });
      return;
    }
    patch({ featuredCategories: [...currentDraft.featuredCategories, category] });
  };

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    return availableProducts.filter((product) =>
      product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query),
    );
  }, [availableProducts, productSearch]);

  const filteredCategories = useMemo(() => {
    const query = categorySearch.trim().toLowerCase();
    return availableCategories.filter((category) =>
      category.name.toLowerCase().includes(query) || category.slug.toLowerCase().includes(query),
    );
  }, [availableCategories, categorySearch]);

  const selectedProductIds = new Set(currentDraft.featuredProducts.map((item) => item.id));
  const selectedCategoryIds = new Set(currentDraft.featuredCategories.map((item) => item.id));

  if (pageLoading) {
    return (
      <div className="grid place-items-center rounded-2xl border border-border bg-card p-12 shadow-card">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <Panel title="Homepage Settings">
        <div className="grid gap-4 sm:grid-cols-2">
          <Mini
            label="Featured products heading"
            value={currentDraft.settings.featuredProductsHeading ?? "Featured products"}
            onChange={(v) => patchSettings({ featuredProductsHeading: v })}
          />
          <Mini
            label="Featured categories heading"
            value={currentDraft.settings.featuredCategoriesHeading ?? "Shop by category"}
            onChange={(v) => patchSettings({ featuredCategoriesHeading: v })}
          />
        </div>
      </Panel>

      <Panel title="Announcement Bar">
        <ul className="space-y-2">
          {currentDraft.announcements.map((a, i) => (
            <li key={a.id} className="flex items-center gap-2 rounded-xl bg-secondary/60 px-4 py-2.5">
              <input
                value={a.text}
                onChange={(e) =>
                  patch({
                    announcements: currentDraft.announcements.map((x, idx) =>
                      idx === i ? { ...x, text: e.target.value } : x,
                    ),
                  })
                }
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <div className="flex gap-1">
                <IconBtn icon={ChevronUp} onClick={() => i > 0 && moveAnnouncement(i, -1)} />
                <IconBtn icon={ChevronDown} onClick={() => i < currentDraft.announcements.length - 1 && moveAnnouncement(i, 1)} />
                <IconBtn
                  icon={Trash2}
                  color="text-sale"
                  onClick={() => patch({ announcements: currentDraft.announcements.filter((_, idx) => idx !== i) })}
                />
              </div>
            </li>
          ))}
        </ul>
        <AddBtn
          onClick={() =>
            patch({ announcements: [...currentDraft.announcements, { id: uid(), text: "New announcement" }] })
          }
        >
          Add announcement
        </AddBtn>
      </Panel>

      <Panel title="Hero Banners">
        <div className="grid gap-4 lg:grid-cols-3">
          {currentDraft.banners.map((b, i) => (
            <div key={b.id} className="rounded-2xl border border-border bg-card p-3 shadow-card">
              <ImagePlaceholder src={b.imageUrl} alt={b.title} className="aspect-[16/9] w-full" rounded="rounded-xl" />
              <div className="mt-3 space-y-2">
                <Mini label="Eyebrow" value={b.eyebrow} onChange={(v) => setBanner(i, { eyebrow: v })} />
                <Mini label="Title" value={b.title} onChange={(v) => setBanner(i, { title: v })} />
                <Mini label="Subtitle" value={b.subtitle} onChange={(v) => setBanner(i, { subtitle: v })} />
                <Mini label="Button text" value={b.cta} onChange={(v) => setBanner(i, { cta: v })} />
                <Mini label="Link" value={b.href} onChange={(v) => setBanner(i, { href: v })} />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Banner image
                  </span>
                  <ProductImageUploader
                    max={1}
                    aspect={16 / 9}
                    outputWidth={1600}
                    outputHeight={900}
                    desktopMobile
                    value={[b.imageUrl]}
                    onChange={(imgs) => setBanner(i, { imageUrl: imgs[0] ?? "" })}
                    onFilesChange={(files) =>
                      setBannerFiles((prev) => ({ ...prev, [b.id]: files[0] ?? null }))
                    }
                  />
                </div>
              </div>
              <div className="mt-2 flex justify-between gap-2">
                <div className="flex gap-1">
                  <IconBtn icon={ChevronUp} onClick={() => i > 0 && moveBanner(i, -1)} />
                  <IconBtn icon={ChevronDown} onClick={() => i < currentDraft.banners.length - 1 && moveBanner(i, 1)} />
                </div>
                <IconBtn
                  icon={Trash2}
                  color="text-sale"
                  onClick={() => patch({ banners: currentDraft.banners.filter((_, idx) => idx !== i) })}
                />
              </div>
            </div>
          ))}
        </div>
        <AddBtn
          onClick={() =>
            patch({
              banners: [
                ...currentDraft.banners,
                { id: uid(), eyebrow: "New", title: "New banner", subtitle: "", cta: "Shop now", href: "/shop", imageUrl: "" },
              ],
            })
          }
        >
          Add banner
        </AddBtn>
      </Panel>

      <Panel title="Featured Products">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="rounded-2xl border border-border bg-background p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">Selected products</span>
                <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                  {currentDraft.featuredProducts.length}
                </span>
              </div>
              <div className="space-y-2">
                {currentDraft.featuredProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
                    <div className="min-w-0 flex-1 text-sm">
                      <div className="font-semibold">{product.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{product.sku}</div>
                    </div>
                    <div className="flex gap-1">
                      <IconBtn icon={ChevronUp} onClick={() => index > 0 && moveFeaturedProduct(index, -1)} />
                      <IconBtn icon={ChevronDown} onClick={() => index < currentDraft.featuredProducts.length - 1 && moveFeaturedProduct(index, 1)} />
                      <IconBtn
                        icon={Trash2}
                        color="text-sale"
                        onClick={() => patch({ featuredProducts: currentDraft.featuredProducts.filter((_, idx) => idx !== index) })}
                      />
                    </div>
                  </div>
                ))}
                {currentDraft.featuredProducts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/60 bg-secondary/40 p-4 text-sm text-muted-foreground">
                    No featured products selected.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-3">
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products"
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => toggleFeaturedProduct(product)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                      selectedProductIds.has(product.id)
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/70"
                    }`}
                  >
                    <span className="min-w-0 truncate">{product.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {selectedProductIds.has(product.id) ? "Selected" : "Add"}
                    </span>
                  </button>
                ))}
                {filteredProducts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/60 bg-secondary/40 p-4 text-sm text-muted-foreground">
                    No products match the search.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Featured Categories">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="rounded-2xl border border-border bg-background p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">Selected categories</span>
                <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                  {currentDraft.featuredCategories.length}
                </span>
              </div>
              <div className="space-y-2">
                {currentDraft.featuredCategories.map((category, index) => (
                  <div key={category.id} className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
                    <div className="min-w-0 flex-1 text-sm">
                      <div className="font-semibold">{category.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{category.slug}</div>
                    </div>
                    <div className="flex gap-1">
                      <IconBtn icon={ChevronUp} onClick={() => index > 0 && moveFeaturedCategory(index, -1)} />
                      <IconBtn icon={ChevronDown} onClick={() => index < currentDraft.featuredCategories.length - 1 && moveFeaturedCategory(index, 1)} />
                      <IconBtn
                        icon={Trash2}
                        color="text-sale"
                        onClick={() => patch({ featuredCategories: currentDraft.featuredCategories.filter((_, idx) => idx !== index) })}
                      />
                    </div>
                  </div>
                ))}
                {currentDraft.featuredCategories.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/60 bg-secondary/40 p-4 text-sm text-muted-foreground">
                    No featured categories selected.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-3">
              <input
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search categories"
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredCategories.map((category) => (
                  <button
                    key={category.slug}
                    type="button"
                    onClick={() => toggleFeaturedCategory(category)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                      selectedCategoryIds.has(category.id)
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/70"
                    }`}
                  >
                    <span className="min-w-0 truncate">{category.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {selectedCategoryIds.has(category.id) ? "Selected" : "Add"}
                    </span>
                  </button>
                ))}
                {filteredCategories.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/60 bg-secondary/40 p-4 text-sm text-muted-foreground">
                    No categories match the search.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Why DHARAJ Section">
        <div className="grid gap-4 sm:grid-cols-2">
          <Mini label="Heading" value={why.heading} onChange={(v) => patchWhy({ heading: v })} />
          <Mini label="Subheading" value={why.subheading} onChange={(v) => patchWhy({ subheading: v })} />
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={why.enabled} onChange={(e) => patchWhy({ enabled: e.target.checked })} />
          Show this section on the homepage
        </label>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {why.items.map((item, i) => (
            <div key={item.id} className="rounded-2xl border border-border bg-background p-3">
              <ImagePlaceholder src={item.imageUrl} alt={item.title} className="aspect-4/3 w-full" rounded="rounded-xl" />
              <div className="mt-3 space-y-2">
                <Mini label="Badge" value={item.badge ?? ""} onChange={(v) => setWhyItem(i, { badge: v })} />
                <Mini label="Title" value={item.title} onChange={(v) => setWhyItem(i, { title: v })} />
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</span>
                  <textarea
                    value={item.description}
                    onChange={(e) => setWhyItem(i, { description: e.target.value })}
                    rows={3}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
                  />
                </label>
                <ProductImageUploader
                  max={1}
                  aspect={4 / 3}
                  outputWidth={1200}
                  outputHeight={900}
                  value={[item.imageUrl]}
                  onChange={(imgs) => setWhyItem(i, { imageUrl: imgs[0] ?? "" })}
                  onFilesChange={(files) => setWhyFiles((prev) => ({ ...prev, [item.id]: files[0] ?? null }))}
                />
              </div>
              <div className="mt-2 flex justify-between gap-2">
                <div className="flex gap-1">
                  <IconBtn icon={ChevronUp} onClick={() => i > 0 && patchWhy({ items: moveItem(why.items, i, -1) })} />
                  <IconBtn icon={ChevronDown} onClick={() => i < why.items.length - 1 && patchWhy({ items: moveItem(why.items, i, 1) })} />
                </div>
                <IconBtn icon={Trash2} color="text-sale" onClick={() => patchWhy({ items: why.items.filter((_, idx) => idx !== i) })} />
              </div>
            </div>
          ))}
        </div>
        <AddBtn
          onClick={() =>
            patchWhy({
              items: [...why.items, { id: uid(), title: "New highlight", description: "", imageUrl: "", badge: "" }],
            })
          }
        >
          Add highlight
        </AddBtn>
      </Panel>

      <Panel title="Instagram / Reviews Feed">
        <div className="grid gap-4 sm:grid-cols-2">
          <Mini label="Heading" value={social.heading} onChange={(v) => patchSocial({ heading: v })} />
          <Mini label="Subheading" value={social.subheading} onChange={(v) => patchSocial({ subheading: v })} />
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={social.enabled} onChange={(e) => patchSocial({ enabled: e.target.checked })} />
          Show this section on the homepage
        </label>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {social.items.map((item, i) => (
            <div key={item.id} className="rounded-2xl border border-border bg-background p-3">
              <ImagePlaceholder src={item.imageUrl} alt={item.caption} className="aspect-9/16 w-full" rounded="rounded-xl" />
              <div className="mt-3 space-y-2">
                <Mini label="Handle" value={item.handle} onChange={(v) => setSocialItem(i, { handle: v })} />
                <Mini label="Caption" value={item.caption} onChange={(v) => setSocialItem(i, { caption: v })} />
                <Mini label="Post link" value={item.href} onChange={(v) => setSocialItem(i, { href: v })} />
                <ProductImageUploader
                  max={1}
                  aspect={9 / 16}
                  outputWidth={720}
                  outputHeight={1280}
                  value={[item.imageUrl]}
                  onChange={(imgs) => setSocialItem(i, { imageUrl: imgs[0] ?? "" })}
                  onFilesChange={(files) => setSocialFiles((prev) => ({ ...prev, [item.id]: files[0] ?? null }))}
                />
              </div>
              <div className="mt-2 flex justify-between gap-2">
                <div className="flex gap-1">
                  <IconBtn icon={ChevronUp} onClick={() => i > 0 && patchSocial({ items: moveItem(social.items, i, -1) })} />
                  <IconBtn icon={ChevronDown} onClick={() => i < social.items.length - 1 && patchSocial({ items: moveItem(social.items, i, 1) })} />
                </div>
                <IconBtn icon={Trash2} color="text-sale" onClick={() => patchSocial({ items: social.items.filter((_, idx) => idx !== i) })} />
              </div>
            </div>
          ))}
        </div>
        <AddBtn
          onClick={() =>
            patchSocial({
              items: [...social.items, { id: uid(), imageUrl: "", caption: "", handle: "@dharaj", href: "" }],
            })
          }
        >
          Add post
        </AddBtn>
      </Panel>

      <Panel title="Circular Shortcut Buttons">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {currentDraft.shortcuts.map((s, i) => (
            <div key={s.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 shadow-card">
              <div className="flex items-center gap-3">
                <ImagePlaceholder src={s.imageUrl} alt={s.label} className="aspect-square w-14" rounded="rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Mini label="Label" value={s.label} onChange={(v) => setShortcut(i, { label: v })} />
                  <Mini label="Link" value={s.href} onChange={(v) => setShortcut(i, { href: v })} />
                </div>
              </div>
              <ProductImageUploader
                max={1}
                value={[s.imageUrl]}
                onChange={(imgs) => setShortcut(i, { imageUrl: imgs[0] ?? "" })}
                onFilesChange={(files) =>
                  setShortcutFiles((prev) => ({ ...prev, [s.id]: files[0] ?? null }))
                }
              />
              <div className="flex justify-between gap-2">
                <IconBtn
                  icon={Trash2}
                  color="text-sale"
                  onClick={() => patch({ shortcuts: currentDraft.shortcuts.filter((_, idx) => idx !== i) })}
                />
                <span className="text-xs text-muted-foreground">Shortcut {i + 1}</span>
              </div>
            </div>
          ))}
        </div>
        <AddBtn
          onClick={() =>
            patch({
              shortcuts: [...currentDraft.shortcuts, { id: uid(), label: "New", href: "/shop", imageUrl: "" }],
            })
          }
        >
          Add shortcut
        </AddBtn>
      </Panel>

      <div className="fixed bottom-4 right-4 z-30">
        <button
          onClick={() => save.mutate(currentDraft)}
          disabled={save.isPending || pageLoading}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-card hover:bg-primary-hover disabled:opacity-60"
        >
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save homepage
        </button>
      </div>
    </div>
  );
}

function Mini({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-widest">{title}</h2>
      {children}
    </section>
  );
}
function IconBtn({ icon: Icon, color = "", onClick }: { icon: any; color?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`grid h-8 w-8 place-items-center rounded-full hover:bg-secondary ${color}`}>
      <Icon className="h-4 w-4" />
    </button>
  );
}
function AddBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mt-4 inline-flex items-center gap-2 rounded-full border border-dashed border-primary/40 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/5"
    >
      <Plus className="h-3.5 w-3.5" /> {children}
    </button>
  );
}
