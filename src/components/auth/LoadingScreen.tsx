import { Leaf } from "lucide-react";
import { motion } from "framer-motion";

export function LoadingScreen({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
          className="grid h-14 w-14 place-items-center rounded-full bg-turmeric text-foreground shadow-card"
        >
          <Leaf className="h-6 w-6" />
        </motion.span>
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
