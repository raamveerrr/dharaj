import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import type { WhySection } from "@/lib/db/catalog";

export function WhyDharaj({ section }: { section?: WhySection }) {
  if (!section || section.enabled === false || section.items.length === 0) return null;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-card px-4 py-10 shadow-card sm:px-10 sm:py-14">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-turmeric/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 text-center"
      >
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-4xl">{section.heading}</h2>
        <span className="mx-auto mt-3 grid h-7 w-7 place-items-center text-turmeric">
          <Sparkles className="h-5 w-5" />
        </span>
        {section.subheading ? (
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{section.subheading}</p>
        ) : null}
      </motion.div>

      <div className="relative z-10 mt-8 space-y-10 sm:mt-12 sm:space-y-16">
        {section.items.map((item, index) => {
          const flip = index % 2 === 1;
          return (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
              className={`grid items-center gap-6 sm:grid-cols-2 sm:gap-10 ${flip ? "sm:[&>figure]:order-first" : ""}`}
            >
              <div className="min-w-0">
                {item.badge ? (
                  <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
                    {item.badge}
                  </span>
                ) : null}
                <h3 className="mt-3 text-xl font-extrabold sm:text-3xl">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{item.description}</p>
              </div>

              <motion.figure
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className="relative"
              >
                <div className="absolute inset-0 -z-10 translate-y-4 rounded-[2rem] bg-primary/10 blur-xl" />
                <ImagePlaceholder
                  src={item.imageUrl}
                  alt={item.title}
                  className="aspect-4/3 w-full"
                  rounded="rounded-[1.75rem]"
                />
              </motion.figure>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
