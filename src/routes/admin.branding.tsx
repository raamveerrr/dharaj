import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image as ImageIcon, Loader2, Save, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { CloudinaryService } from "@/services/cloudinaryService";
import { BrandLockup } from "@/components/common/BrandLogo";
import { getBranding, saveBranding, defaultBranding, type BrandingSettings } from "@/lib/db/branding";

export const Route = createFileRoute("/admin/branding")({
  head: () => ({
    meta: [{ title: "Branding & Logos — Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminBranding,
});

type Slot = "header" | "drawer" | "footer" | "admin";

const slots: Array<{ slot: Slot; field: keyof BrandingSettings; label: string; hint: string }> = [
  { slot: "header", field: "headerLogoUrl", label: "Header logo", hint: "Shown top-left on every storefront page" },
  { slot: "drawer", field: "drawerLogoUrl", label: "Mobile menu logo", hint: "Falls back to the header logo" },
  { slot: "footer", field: "footerLogoUrl", label: "Footer logo", hint: "Falls back to the header logo" },
  { slot: "admin", field: "adminLogoUrl", label: "Admin sidebar logo", hint: "Falls back to the header logo" },
];

function LogoSlot({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const uploaded = await CloudinaryService.uploadImage(file, "branding");
      onChange(uploaded.url);
      toast.success(`${label} uploaded`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-bold">{label}</div>
          <div className="text-xs text-muted-foreground">{hint}</div>
        </div>
        {value && (
          <button
            onClick={() => onChange("")}
            className="grid h-8 w-8 place-items-center rounded-full border border-border text-destructive hover:bg-secondary"
            aria-label={`Remove ${label}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-3 grid h-24 place-items-center rounded-xl border border-dashed border-border bg-secondary/40 p-2">
        {value ? (
          <img src={value} alt={label} className="max-h-20 w-auto object-contain" />
        ) : (
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <ImageIcon className="h-4 w-4" /> No logo uploaded
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading…" : "Upload image"}
        </button>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="…or paste an image URL"
          className="w-full rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
        />
      </div>
    </div>
  );
}

function AdminBranding() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["branding"], queryFn: getBranding });
  const [draft, setDraft] = useState<BrandingSettings | null>(null);

  useEffect(() => {
    if (data && !draft) setDraft(data);
  }, [data, draft]);

  const save = useMutation({
    mutationFn: saveBranding,
    onSuccess: (_r, variables) => {
      qc.setQueryData(["branding"], variables);
      void qc.invalidateQueries({ queryKey: ["branding"] });
      toast.success("Branding updated", { description: "The storefront logo is live." });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not save branding"),
  });

  if (isLoading || !draft) {
    return (
      <div className="grid h-64 place-items-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const set = <K extends keyof BrandingSettings>(key: K, value: BrandingSettings[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  return (
    <div className="space-y-4 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
        <div>
          <div className="text-lg font-bold">Branding &amp; Logos</div>
          <div className="text-sm text-muted-foreground">
            Upload logos for each surface. Changes go live on the storefront after saving.
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDraft(defaultBranding)}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
          >
            Reset
          </button>
          <button
            onClick={() => save.mutate(draft)}
            disabled={save.isPending}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
          >
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </button>
        </div>
      </div>

      {/* Live preview */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="font-bold">Live preview</div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Storefront header
            </div>
            <BrandLockup branding={draft} slot="header" />
          </div>
          <div className="rounded-xl border border-border bg-secondary/40 p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Footer
            </div>
            <BrandLockup branding={draft} slot="footer" />
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Mobile drawer
            </div>
            <BrandLockup branding={draft} slot="drawer" />
          </div>
          <div className="rounded-xl border border-sidebar-border bg-sidebar p-4 text-sidebar-foreground">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-70">
              Admin sidebar
            </div>
            <BrandLockup
              branding={draft}
              slot="admin"
              fallbackClassName="bg-turmeric text-foreground"
              wordmarkClassName="text-lg text-sidebar-foreground"
            />
          </div>
        </div>
      </div>

      {/* Wordmark + sizing */}
      <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-card sm:grid-cols-3">
        <label className="text-sm">
          <span className="font-semibold">Wordmark text</span>
          <input
            value={draft.wordmark}
            onChange={(e) => set("wordmark", e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary"
          />
        </label>
        <label className="text-sm">
          <span className="font-semibold">Logo height ({draft.logoHeight}px)</span>
          <input
            type="range"
            min={24}
            max={72}
            value={draft.logoHeight}
            onChange={(e) => set("logoHeight", Number(e.target.value))}
            className="mt-3 w-full accent-primary"
          />
        </label>
        <label className="text-sm">
          <span className="font-semibold">Alt text</span>
          <input
            value={draft.altText}
            onChange={(e) => set("altText", e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary"
          />
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-3">
          <input
            type="checkbox"
            checked={draft.showWordmark}
            onChange={(e) => set("showWordmark", e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Show &quot;{draft.wordmark || "wordmark"}&quot; text next to the logo
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {slots.map((s) => (
          <LogoSlot
            key={s.slot}
            label={s.label}
            hint={s.hint}
            value={String(draft[s.field] ?? "")}
            onChange={(url) => set(s.field, url as never)}
          />
        ))}
      </div>
    </div>
  );
}
