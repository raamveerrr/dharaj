import { useState } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";

interface Props {
  initial?: (string | null)[];
  max?: number;
  onChange?: (images: (string | null)[]) => void;
}

// Frontend-only image upload slots. Uses object URLs for preview so the
// architecture already accepts real File uploads; wire to storage later.
export function ProductImageUploader({ initial, max = 5, onChange }: Props) {
  const [images, setImages] = useState<(string | null)[]>(
    () => initial ?? Array.from({ length: max }, () => null),
  );

  const update = (next: (string | null)[]) => {
    setImages(next);
    onChange?.(next);
  };

  const handleFile = (i: number, file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const next = [...images];
    next[i] = url;
    update(next);
  };

  const clear = (i: number) => {
    const next = [...images];
    if (next[i]?.startsWith("blob:")) URL.revokeObjectURL(next[i]!);
    next[i] = null;
    update(next);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {images.map((src, i) => (
          <div key={i} className="relative">
            <label
              className={cn(
                "flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-secondary/40 transition hover:border-primary hover:bg-primary/5",
                src && "border-solid border-border",
              )}
            >
              {src ? (
                <ImagePlaceholder src={src} className="h-full w-full" rounded="rounded-2xl" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Upload className="h-5 w-5" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest">
                    Image {i + 1}
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(i, e.target.files?.[0])}
              />
            </label>
            {src && (
              <button
                type="button"
                onClick={() => clear(i)}
                aria-label={`Remove image ${i + 1}`}
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-card/95 shadow-card hover:bg-sale hover:text-primary-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {i === 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary-foreground">
                Main
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Up to {max} images. First image is used as the main product photo.
      </p>
    </div>
  );
}
