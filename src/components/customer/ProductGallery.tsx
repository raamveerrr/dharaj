import { useCallback, useEffect } from "react";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGallery } from "@/stores/gallery";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import { cn } from "@/lib/utils";

interface Props {
  productId: string;
  images: string[];
  alt: string;
  badge?: React.ReactNode;
}

const SWIPE_THRESHOLD = 60;

export function ProductGallery({ productId, images, alt, badge }: Props) {
  const index = useGallery((s) => s.indexByProduct[productId] ?? 0);
  const setIndex = useGallery((s) => s.setIndex);

  const n = images.length;
  const go = useCallback(
    (i: number) => setIndex(productId, ((i % n) + n) % n),
    [n, productId, setIndex],
  );
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  // Keyboard arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) next();
    else if (info.offset.x > SWIPE_THRESHOLD) prev();
  };

  return (
    <div className="select-none">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-secondary/30">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={onDragEnd}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="cursor-grab active:cursor-grabbing"
          >
            <ImagePlaceholder
              src={images[index]}
              alt={`${alt} — image ${index + 1}`}
              className="aspect-square w-full"
              rounded="rounded-3xl"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </motion.div>
        </AnimatePresence>

        {badge}

        {/* Arrows */}
        {n > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 hidden -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-card/95 shadow-card backdrop-blur transition hover:scale-110 sm:grid"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 hidden -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-card/95 shadow-card backdrop-blur transition hover:scale-110 sm:grid"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Dots */}
        {n > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full bg-primary/40 transition-all",
                  i === index ? "w-6 bg-primary" : "w-1.5",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {n > 1 && (
        <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Show image ${i + 1}`}
              className={cn(
                "shrink-0 overflow-hidden rounded-xl border-2 transition",
                i === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <ImagePlaceholder
                src={src}
                alt={`${alt} thumbnail ${i + 1}`}
                className="h-16 w-16 sm:h-20 sm:w-20"
                rounded="rounded-lg"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
