import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, BadgeCheck, X } from "lucide-react";
import { mockReviews, ratingSummary, type CustomerReview } from "@/lib/reviews";
import { avatarUrl, reviewPhoto } from "@/lib/mockImages";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={cn(
            i <= Math.round(value) ? "fill-turmeric text-turmeric" : "text-muted-foreground/30",
          )}
        />
      ))}
    </span>
  );
}

export function ProductReviews({ productName }: { productName: string }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<number | null>(null);

  const summary = useMemo(() => ratingSummary(mockReviews), []);
  const list = useMemo(
    () => (filter ? mockReviews.filter((r) => r.rating === filter) : mockReviews),
    [filter],
  );

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-extrabold sm:text-2xl">Customer Reviews</h2>
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-soft hover:bg-primary-hover"
        >
          Write a Review
        </button>
      </div>

      <div className="grid gap-6 rounded-3xl border border-border bg-card p-5 sm:p-6 md:grid-cols-[260px_1fr]">
        {/* Overall */}
        <div className="flex flex-col items-center justify-center border-b border-border pb-5 text-center md:border-b-0 md:border-r md:pb-0 md:pr-6">
          <div className="text-5xl font-extrabold text-primary">{summary.average.toFixed(1)}</div>
          <Stars value={summary.average} size={18} />
          <div className="mt-1 text-xs text-muted-foreground">
            Based on {summary.total} reviews
          </div>
        </div>

        {/* Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((n) => {
            const count = summary.dist[n as 1 | 2 | 3 | 4 | 5];
            const pct = summary.total ? (count / summary.total) * 100 : 0;
            const active = filter === n;
            return (
              <button
                key={n}
                onClick={() => setFilter(active ? null : n)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-2 py-1 text-sm transition hover:bg-secondary",
                  active && "bg-secondary",
                )}
              >
                <span className="flex w-10 items-center gap-1 text-xs font-semibold">
                  {n} <Star className="h-3 w-3 fill-turmeric text-turmeric" />
                </span>
                <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-turmeric transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </span>
                <span className="w-8 text-right text-xs text-muted-foreground">{count}</span>
              </button>
            );
          })}
          {filter && (
            <button
              onClick={() => setFilter(null)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Review cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {list.map((r) => (
          <ReviewCard key={r.id} r={r} />
        ))}
        {list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No reviews match this filter.
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && <WriteReviewModal productName={productName} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </section>
  );
}

function ReviewCard({ r }: { r: CustomerReview }) {
  const [helpful, setHelpful] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
    >
      <div className="flex items-start gap-3">
        <img
          src={avatarUrl(r.name)}
          alt={r.name}
          className="h-10 w-10 rounded-full border border-border"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{r.name}</span>
            {r.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-leaf/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                <BadgeCheck className="h-3 w-3" /> Verified Purchase
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <Stars value={r.rating} />
            <span>·</span>
            <span>{r.date}</span>
            {r.variant && (
              <>
                <span>·</span>
                <span>Variant: {r.variant}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold">{r.title}</h4>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
      </div>

      {r.photos && r.photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {r.photos.map((p) => (
            <img
              key={p}
              src={reviewPhoto(p, 200)}
              alt="Customer photo"
              loading="lazy"
              className="h-20 w-20 shrink-0 rounded-lg border border-border object-cover"
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-3">
        <button
          onClick={() => setHelpful((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition",
            helpful
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:bg-secondary",
          )}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          Helpful ({r.helpful + (helpful ? 1 : 0)})
        </button>
        <button className="text-xs text-muted-foreground hover:text-foreground">Report</button>
      </div>
    </motion.div>
  );
}

function WriteReviewModal({
  productName,
  onClose,
}: {
  productName: string;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return toast.error("Please select a rating");
    if (!title.trim()) return toast.error("Please add a title");
    toast.success("Thanks! Your review has been submitted for moderation.");
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <motion.form
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-lg rounded-t-3xl bg-card p-6 shadow-lift sm:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold">Write a Review</h3>
            <p className="text-xs text-muted-foreground">{productName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Your rating
          </label>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(i)}
                aria-label={`${i} star${i > 1 ? "s" : ""}`}
                className="transition hover:scale-110"
              >
                <Star
                  className={cn(
                    "h-8 w-8",
                    i <= (hover || rating)
                      ? "fill-turmeric text-turmeric"
                      : "text-muted-foreground/30",
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Review title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum up your experience"
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Your review
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="What did you like or dislike? How did you use the product?"
            className="mt-1 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-border py-2.5 text-sm font-bold hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 rounded-full bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
          >
            Submit Review
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}
