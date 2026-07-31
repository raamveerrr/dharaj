import { useEffect, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import { uploadImage } from "@/lib/storage";

interface Props {
  /** Controlled list of image URLs. */
  value?: (string | null)[];
  initial?: (string | null)[];
  max?: number;
  folder?: string;
  onChange?: (images: (string | null)[]) => void;
}

/**
 * Image slots backed by Firebase Storage. Picking a file uploads it and hands
 * the public download URL back through onChange.
 */
export function ProductImageUploader({
  value,
  initial,
  max = 5,
  folder = "products",
  onChange,
}: Props) {
  const [images, setImages] = useState<(string | null)[]>(
    () => value ?? initial ?? Array.from({ length: max }, () => null),
  );
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    if (value) setImages(pad(value, max));
  }, [value, max]);

  const update = (next: (string | null)[]) => {
    setImages(next);
    onChange?.(next);
  };

  const handleFile = async (i: number, file: File | undefined) => {
    if (!file) return;
    setBusy(i);
    try {
      const url = await uploadImage(file, folder);
      const next = [...images];
      next[i] = url;
      update(next);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error((err as Error)?.message ?? "Upload failed");
    } finally {
      setBusy(null);
    }
  };

  const clear = (i: number) => {
    const next = [...images];
    next[i] = null;
    update(next);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {pad(images, max).map((src, i) => (
          <div key={i} className="relative">
            <label
              className={cn(
                "flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-secondary/40 transition hover:border-primary hover:bg-primary/5",
                src && "border-solid border-border",
              )}
            >
              {busy === i ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : src ? (
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
                disabled={busy !== null}
                onChange={(e) => handleFile(i, e.target.files?.[0])}
              />
            </label>
            {src && busy !== i && (
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

function pad(list: (string | null)[], max: number) {
  const next = [...list].slice(0, max);
  while (next.length < max) next.push(null);
  return next;
}
