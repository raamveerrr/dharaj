import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";

export function HeroSlider() {
  const { banners: heroSlides } = useHomepageContent();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = heroSlides.length;

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % n), 4000);
    return () => clearInterval(t);
  }, [paused, n]);

  const slide = heroSlides[i % Math.max(heroSlides.length, 1)];
  if (!slide) return null;

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-secondary via-background to-accent/40"
    >
      <div className="grid gap-6 p-6 sm:p-10 md:grid-cols-2 md:items-center md:p-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              {slide.eyebrow}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
              {slide.title}
            </h1>
            <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
              {slide.subtitle}
            </p>
            <Link
              to={slide.href}
              className="mt-6 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary-hover"
            >
              {slide.cta}
            </Link>
          </motion.div>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id + "-img"}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5 }}
          >
            <ImagePlaceholder
              src={slide.imageUrl}
              alt={slide.title}
              label="Hero image"
              className="aspect-[4/3] w-full md:aspect-square"
              rounded="rounded-3xl"
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between px-6 pb-6 sm:px-10">
        <div className="flex gap-1.5">
          {heroSlides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setI(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-8 bg-primary" : "w-1.5 bg-primary/30"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setI((v) => (v - 1 + n) % n)}
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:bg-secondary"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setI((v) => (v + 1) % n)}
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:bg-secondary"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
