import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useHomepageContent } from "@/hooks/useHomepageContent";

export function AnnouncementBar() {
  const { announcements } = useHomepageContent();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const t = setInterval(() => setI((v) => (v + 1) % announcements.length), 3200);
    return () => clearInterval(t);
  }, [announcements.length]);

  if (!announcements.length) return null;

  return (
    <div className="bg-primary text-primary-foreground text-xs sm:text-sm">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center overflow-hidden px-4">
        <AnimatePresence mode="wait">
          <motion.span
            key={announcements[i % announcements.length]?.id}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="text-center font-medium"
          >
            {announcements[i % announcements.length]?.text}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
