import { createFileRoute } from "@tanstack/react-router";
import { Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ReviewService } from "@/services/reviewService";
import type { Review } from "@/types/review";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminReviews,
});

function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    try {
      setReviews(await ReviewService.getAllReviews());
    } catch {
      toast.error("Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await ReviewService.deleteReview(id);
      setReviews((current) => current.filter((item) => item.id !== id));
      toast.success("Review deleted.");
    } catch {
      toast.error("Unable to delete review.");
    }
  };

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">Loading reviews…</div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
          No reviews found.
        </div>
      ) : (
        reviews.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold">{r.name}</div>
                <div className="text-xs text-muted-foreground">
                  on {r.productName} · {r.date}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-turmeric">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <button
                  onClick={() => void handleDelete(r.id)}
                  className="grid h-8 w-8 place-items-center rounded-full text-sale hover:bg-sale/10"
                  aria-label="Delete review"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {r.status}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
          </div>
        ))
      )}
    </div>
  );
}
