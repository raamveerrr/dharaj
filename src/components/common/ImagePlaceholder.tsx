import { useState } from "react";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  label?: string;
  rounded?: string;
  src?: string;
  alt?: string;
  loading?: "lazy" | "eager";
  objectFit?: "cover" | "contain";
}

export function ImagePlaceholder({
  className,
  label,
  rounded = "rounded-2xl",
  src,
  alt,
  loading = "lazy",
  objectFit = "cover",
}: Props) {
  const [errored, setErrored] = useState(false);
  const showImg = src && !errored;

  return (
    <div
      className={cn(
        "placeholder-img relative overflow-hidden border border-border/60",
        rounded,
        className,
      )}
      aria-label={alt ?? label ?? "Image"}
    >
      {showImg ? (
        <img
          src={src}
          alt={alt ?? label ?? ""}
          loading={loading}
          onError={() => setErrored(true)}
          className={cn(
            "h-full w-full transition-opacity duration-500",
            objectFit === "cover" ? "object-cover" : "object-contain",
          )}
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex flex-col items-center gap-1 text-primary/50">
            <Leaf className="h-6 w-6" />
            {label ? (
              <span className="text-[10px] uppercase tracking-widest">{label}</span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
