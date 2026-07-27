import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import { shortcutImage } from "@/lib/mockImages";

export function ShortcutCircle({ label, href }: { label: string; href: string }) {
  return (
    <Link to={href} className="group flex flex-col items-center gap-2 text-center">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
        <ImagePlaceholder
          src={shortcutImage(label)}
          alt={label}
          className="aspect-square w-20 sm:w-24 md:w-28 shadow-card group-hover:shadow-lift transition-shadow"
          rounded="rounded-full"
        />
      </motion.div>
      <span className="text-xs font-semibold sm:text-sm">{label}</span>
    </Link>
  );
}
