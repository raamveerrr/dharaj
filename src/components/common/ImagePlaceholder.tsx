import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  label?: string;
  rounded?: string;
}

export function ImagePlaceholder({ className, label, rounded = "rounded-2xl" }: Props) {
  return (
    <div
      className={cn(
        "placeholder-img flex items-center justify-center border border-border/60",
        rounded,
        className,
      )}
      aria-label={label ?? "Image placeholder"}
    >
      <div className="relative flex flex-col items-center gap-1 text-primary/50">
        <Leaf className="h-6 w-6" />
        {label ? <span className="text-[10px] uppercase tracking-widest">{label}</span> : null}
      </div>
    </div>
  );
}
