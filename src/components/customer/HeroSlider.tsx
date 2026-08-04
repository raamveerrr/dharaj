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
    if (paused || n <= 1) return;
    const t = setInterval(() => setI((v) => (v + 1) % n), 4000);
    return () => clearInterval(t);
  }, [paused, n]);

  if (!heroSlides.length) return null;
  const slide = heroSlides[i % n];

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative w-full overflow-hidden rounded-3xl border border-border bg-secondary"
    >
      {/* Cinematic responsive frame: 16:9 mobile -> 16:7 tablet -> 21:8 desktop */}
      <div className="relative aspect-16/9 w-full max-h-[240px] sm:aspect-[16/7] sm:max-h-[330px] lg:aspect-[21/8] lg:max-h-[380px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id + "-img"}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <ImagePlaceholder
              src={slide.imageUrl}
              alt={slide.title}
              label="Hero image"
              className="hero-image h-full w-full"
              rounded="rounded-none"
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>

        {/* Readability scrim */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/85 via-background/45 to-transparent" />

        <div className="absolute inset-0 flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45 }}
              className="max-w-[70%] px-4 sm:max-w-md sm:px-8 lg:px-12"
            >
              <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary sm:px-3 sm:py-1 sm:text-xs">
                {slide.eyebrow}
              </span>
              <h1 className="mt-2 text-lg font-extrabold leading-tight sm:mt-3 sm:text-2xl lg:text-4xl">
                {slide.title}
              </h1>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:mt-2 sm:text-sm">
                {slide.subtitle}
              </p>
              <Link
                to={slide.href}
                className="mt-3 inline-flex items-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition hover:bg-primary-hover sm:mt-5 sm:px-6 sm:py-3 sm:text-sm"
              >
                {slide.cta}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 pb-3 sm:px-6 sm:pb-4">
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
              className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card/80 backdrop-blur hover:bg-secondary sm:h-9 sm:w-9"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setI((v) => (v + 1) % n)}
              className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card/80 backdrop-blur hover:bg-secondary sm:h-9 sm:w-9"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
