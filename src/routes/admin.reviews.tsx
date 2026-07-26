import { createFileRoute } from "@tanstack/react-router";
import { Star, Trash2 } from "lucide-react";
import { reviews } from "@/lib/data";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminReviews,
});

function AdminReviews() {
  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold">{r.user}</div>
              <div className="text-xs text-muted-foreground">on {r.product} · {r.date}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex text-turmeric">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <button className="grid h-8 w-8 place-items-center rounded-full text-sale hover:bg-sale/10">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
        </div>
      ))}
    </div>
  );
}
