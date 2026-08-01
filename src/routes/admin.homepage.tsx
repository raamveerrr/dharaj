import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import { ProductImageUploader } from "@/components/admin/ProductImageUploader";
import { CloudinaryService } from "@/services/cloudinaryService";
import {
  getHomepage,
  saveHomepage,
  type HomepageContent,
  type Banner,
  type Shortcut,
} from "@/lib/db/catalog";

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

  useEffect(() => {
    if (data && !draft) setDraft(data);
  }, [data, draft]);

  const save = useMutation({
    mutationFn: async (content: HomepageContent) => {
      const uploadedBanners = await Promise.all(
        content.banners.map(async (banner) => {
          const pendingFile = bannerFiles[banner.id];
          if (!pendingFile) return banner;
          const uploaded = await CloudinaryService.uploadImage(pendingFile, "banners");
          return { ...banner, imageUrl: uploaded.url };
        }),
      );
      const uploadedShortcuts = await Promise.all(
        content.shortcuts.map(async (shortcut) => {
          const pendingFile = shortcutFiles[shortcut.id];
          if (!pendingFile) return shortcut;
          const uploaded = await CloudinaryService.uploadImage(pendingFile, "shortcuts");
          return { ...shortcut, imageUrl: uploaded.url };
        }),
      );

      return saveHomepage({
        ...content,
        banners: uploadedBanners,
        shortcuts: uploadedShortcuts,
      });
    },
    onSuccess: () => {
      toast.success("Homepage saved");
      qc.invalidateQueries({ queryKey: ["homepage"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not save"),
  });

  if (isLoading || !draft) {
    return (
      <div className="grid place-items-center rounded-2xl border border-border bg-card p-12 shadow-card">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const patch = (p: Partial<HomepageContent>) => setDraft({ ...draft, ...p });

  const setBanner = (i: number, b: Partial<Banner>) =>
    patch({ banners: draft.banners.map((x, idx) => (idx === i ? { ...x, ...b } : x)) });

  const setShortcut = (i: number, s: Partial<Shortcut>) =>
    patch({ shortcuts: draft.shortcuts.map((x, idx) => (idx === i ? { ...x, ...s } : x)) });

  return (
    <div className="space-y-6 pb-24">
      <Panel title="Announcement Bar">
        <ul className="space-y-2">
          {draft.announcements.map((a, i) => (
            <li key={a.id} className="flex items-center gap-2 rounded-xl bg-secondary/60 px-4 py-2.5">
              <input
                value={a.text}
                onChange={(e) =>
                  patch({
                    announcements: draft.announcements.map((x, idx) =>
                      idx === i ? { ...x, text: e.target.value } : x,
                    ),
                  })
                }
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <IconBtn
                icon={Trash2}
                color="text-sale"
                onClick={() =>
                  patch({ announcements: draft.announcements.filter((_, idx) => idx !== i) })
                }
              />
            </li>
          ))}
        </ul>
        <AddBtn
          onClick={() =>
            patch({ announcements: [...draft.announcements, { id: uid(), text: "New announcement" }] })
          }
        >
          Add announcement
        </AddBtn>
      </Panel>

      <Panel title="Hero Banners">
        <div className="grid gap-4 lg:grid-cols-3">
          {draft.banners.map((b, i) => (
            <div key={b.id} className="rounded-2xl border border-border bg-card p-3 shadow-card">
              <ImagePlaceholder src={b.imageUrl} alt={b.title} className="aspect-video w-full" rounded="rounded-xl" />
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
                    value={[b.imageUrl]}
                    onChange={(imgs) => setBanner(i, { imageUrl: imgs[0] ?? "" })}
                    onFilesChange={(files) =>
                      setBannerFiles((prev) => ({ ...prev, [b.id]: files[0] ?? null }))
                    }
                  />
                </div>
              </div>
              <div className="mt-2 flex justify-end">
                <IconBtn
                  icon={Trash2}
                  color="text-sale"
                  onClick={() => patch({ banners: draft.banners.filter((_, idx) => idx !== i) })}
                />
              </div>
            </div>
          ))}
        </div>
        <AddBtn
          onClick={() =>
            patch({
              banners: [
                ...draft.banners,
                { id: uid(), eyebrow: "New", title: "New banner", subtitle: "", cta: "Shop now", href: "/shop", imageUrl: "" },
              ],
            })
          }
        >
          Add banner
        </AddBtn>
      </Panel>

      <Panel title="Circular Shortcut Buttons">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {draft.shortcuts.map((s, i) => (
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
              <div className="flex justify-end">
                <IconBtn
                  icon={Trash2}
                  color="text-sale"
                  onClick={() => patch({ shortcuts: draft.shortcuts.filter((_, idx) => idx !== i) })}
                />
              </div>
            </div>
          ))}
        </div>
        <AddBtn
          onClick={() =>
            patch({
              shortcuts: [...draft.shortcuts, { id: uid(), label: "New", href: "/shop", imageUrl: "" }],
            })
          }
        >
          Add shortcut
        </AddBtn>
      </Panel>

      <div className="fixed bottom-4 right-4 z-30">
        <button
          onClick={() => save.mutate(draft)}
          disabled={save.isPending}
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
