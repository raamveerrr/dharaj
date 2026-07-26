import { createFileRoute } from "@tanstack/react-router";
import { Edit2, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { announcements, heroSlides, shortcuts } from "@/lib/data";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";

export const Route = createFileRoute("/admin/homepage")({
  head: () => ({ meta: [{ title: "Homepage — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminHomepage,
});

function AdminHomepage() {
  return (
    <div className="space-y-6">
      <Panel title="Announcement Bar">
        <ul className="space-y-2">
          {announcements.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-2.5">
              <span className="text-sm">{a.text}</span>
              <div className="flex gap-1">
                <IconBtn icon={Edit2} />
                <IconBtn icon={Trash2} color="text-sale" />
              </div>
            </li>
          ))}
        </ul>
        <AddBtn>Add announcement</AddBtn>
      </Panel>

      <Panel title="Hero Slider">
        <div className="grid gap-3 sm:grid-cols-3">
          {heroSlides.map((s) => (
            <div key={s.id} className="rounded-2xl border border-border bg-card p-3 shadow-card">
              <ImagePlaceholder className="aspect-video w-full" rounded="rounded-xl" />
              <div className="mt-2 text-xs font-semibold uppercase text-primary">{s.eyebrow}</div>
              <div className="text-sm font-bold">{s.title}</div>
              <div className="text-xs text-muted-foreground">{s.subtitle}</div>
              <div className="mt-2 flex justify-end gap-1">
                <IconBtn icon={Edit2} />
                <IconBtn icon={Trash2} color="text-sale" />
              </div>
            </div>
          ))}
        </div>
        <AddBtn>Add slide</AddBtn>
      </Panel>

      <Panel title="Circular Shortcut Buttons">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {shortcuts.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-card">
              <ImagePlaceholder className="aspect-square w-16" rounded="rounded-full" />
              <div className="text-xs font-semibold">{s.label}</div>
              <div className="flex gap-1">
                <IconBtn icon={Edit2} />
                <IconBtn icon={Trash2} color="text-sale" />
              </div>
            </div>
          ))}
        </div>
        <AddBtn>Add shortcut</AddBtn>
      </Panel>

      <Panel title="Homepage Sections">
        <ul className="space-y-2 text-sm">
          {["Best Sellers", "Featured Offers", "Category Ordering", "New Arrivals"].map((s) => (
            <li key={s} className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-2.5">
              <span>{s}</span>
              <div className="flex gap-1">
                <IconBtn icon={ImageIcon} />
                <IconBtn icon={Edit2} />
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
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
function IconBtn({ icon: Icon, color = "" }: { icon: any; color?: string }) {
  return (
    <button className={`grid h-8 w-8 place-items-center rounded-full hover:bg-secondary ${color}`}>
      <Icon className="h-4 w-4" />
    </button>
  );
}
function AddBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="mt-4 inline-flex items-center gap-2 rounded-full border border-dashed border-primary/40 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/5">
      <Plus className="h-3.5 w-3.5" /> {children}
    </button>
  );
}
