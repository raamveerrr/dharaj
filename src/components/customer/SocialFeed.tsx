import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import type { SocialSection } from "@/lib/db/catalog";

export function SocialFeed({ section }: { section?: SocialSection }) {
  if (!section || section.enabled === false || section.items.length === 0) return null;

  return (
    <section className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center"
      >
        <h2 className="text-xl font-extrabold sm:text-3xl">{section.heading}</h2>
        {section.subheading ? (
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">{section.subheading}</p>
        ) : null}
      </motion.div>

      <div className="hide-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
        {section.items.map((item, index) => (
          <motion.a
            key={item.id}
            href={item.href || "#"}
            target={item.href ? "_blank" : undefined}
            rel="noreferrer"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: Math.min(index * 0.06, 0.3) }}
            whileHover={{ y: -6 }}
            className="group relative w-[170px] shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card shadow-card sm:w-[210px]"
          >
            <ImagePlaceholder
              src={item.imageUrl}
              alt={item.caption || item.handle}
              className="aspect-9/16 w-full"
              rounded="rounded-none"
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-2 bg-gradient-to-b from-foreground/60 to-transparent p-3 text-xs font-semibold text-background">
              <Instagram className="h-3.5 w-3.5" />
              <span className="truncate">{item.handle}</span>
            </div>
            {item.caption ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/75 to-transparent p-3 text-xs font-bold text-background">
                <span className="line-clamp-2">{item.caption}</span>
              </div>
            ) : null}
          </motion.a>
        ))}
      </div>
    </section>
  );
}
