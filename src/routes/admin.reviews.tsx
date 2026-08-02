import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Star, Trash2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ReviewService } from "@/services/reviewService";
import type { Review } from "@/types/review";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminReviews,
});

function AdminReviews() {
  const queryClient = useQueryClient();
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

  const handleStatusChange = async (id: string, status: "approved" | "rejected") => {
    try {
      await ReviewService.updateReviewStatus(id, status);
      await queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setReviews((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
      toast.success(status === "approved" ? "Review approved." : "Review rejected.");
    } catch {
      toast.error("Unable to update review status.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await ReviewService.deleteReview(id);
      await queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setReviews((current) => current.filter((item) => item.id !== id));
      toast.success("Review removed.");
    } catch {
      toast.error("Unable to remove review.");
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
                  onClick={() => void handleStatusChange(r.id, "approved")}
                  className="grid h-8 w-8 place-items-center rounded-full text-primary hover:bg-primary/10"
                  aria-label="Approve review"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => void handleStatusChange(r.id, "rejected")}
                  className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
                  aria-label="Reject review"
                >
                  <XCircle className="h-4 w-4" />
                </button>
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
