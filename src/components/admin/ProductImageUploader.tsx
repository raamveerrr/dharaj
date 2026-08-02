import { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { Upload, X, Crop, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";

interface Props {
  value?: (string | null)[];
  initial?: (string | null)[];
  max?: number;
  aspect?: number;
  desktopMobile?: boolean;
  outputWidth?: number;
  outputHeight?: number;
  onChange?: (images: (string | null)[]) => void;
  onFilesChange?: (files: (File | null)[]) => void;
}

interface CropState {
  crop: { x: number; y: number };
  zoom: number;
  aspectMode: "desktop" | "mobile";
}

function pad<T>(items: T[], length: number): T[] {
  return Array.from({ length }, (_, index) => items[index] ?? null as T);
}

function createImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  outputWidth: number,
  outputHeight: number,
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to create canvas context.");
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
  });
}

export function ProductImageUploader({
  initial,
  value,
  max = 5,
  aspect = 1,
  desktopMobile = false,
  outputWidth = 1200,
  outputHeight = 1200,
  onChange,
  onFilesChange,
}: Props) {
  const [images, setImages] = useState<(string | null)[]>(() => initial ?? Array.from({ length: max }, () => null));
  const [files, setFiles] = useState<(File | null)[]>(() => Array.from({ length: max }, () => null));
  const [cropState, setCropState] = useState<CropState[]>(() =>
    Array.from({ length: max }, () => ({ crop: { x: 0, y: 0 }, zoom: 1, aspectMode: "desktop" })),
  );
  const [activeCropIndex, setActiveCropIndex] = useState<number | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Record<number, { x: number; y: number; width: number; height: number }>>({});
  const revokeQueue = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (value) {
      setImages(pad(value, max));
    }
  }, [value, max]);

  useEffect(() => {
    return () => {
      revokeQueue.current.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, []);

  const update = useCallback(
    (nextImages: (string | null)[], nextFiles?: (File | null)[]) => {
      setImages(nextImages);
      onChange?.(nextImages);
      if (nextFiles) {
        setFiles(nextFiles);
        onFilesChange?.(nextFiles);
      }
    },
    [onChange, onFilesChange],
  );

  const revokePreview = useCallback((url: string | null) => {
    if (url?.startsWith("blob:")) {
      URL.revokeObjectURL(url);
      revokeQueue.current.delete(url);
    }
  }, []);

  const setPreview = useCallback((index: number, url: string | null) => {
    setImages((prev) => {
      const next = [...prev];
      const previous = next[index];
      if (previous !== url) revokePreview(previous);
      next[index] = url;
      return next;
    });
  }, [revokePreview]);

  const handleFile = (index: number, file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    revokeQueue.current.add(url);

    const nextImages = [...images];
    const nextFiles = [...files];
    nextImages[index] = url;
    nextFiles[index] = file;
    update(nextImages, nextFiles);
    setActiveCropIndex(index);
  };

  const clear = (index: number) => {
    const nextImages = [...images];
    const nextFiles = [...files];
    revokePreview(nextImages[index]);
    nextImages[index] = null;
    nextFiles[index] = null;
    update(nextImages, nextFiles);
    setActiveCropIndex(null);
  };

  const startCrop = (index: number) => {
    setActiveCropIndex(index);
  };

  const currentCrop = activeCropIndex !== null ? cropState[activeCropIndex] : null;
  const targetWidth = currentCrop?.aspectMode === "mobile" && aspect !== 1 ? outputHeight : outputWidth;
  const targetHeight = currentCrop?.aspectMode === "mobile" && aspect !== 1 ? outputWidth : outputHeight;

  const applyCrop = async () => {
    if (activeCropIndex === null) return;
    const source = images[activeCropIndex];
    if (!source) return;

    const pixelCrop = croppedAreaPixels[activeCropIndex];
    if (!pixelCrop) return;

    const blob = await getCroppedBlob(source, pixelCrop, targetWidth, targetHeight);
    if (!blob) return;

    const nextFile = new File([blob], `cropped-${Date.now()}.jpg`, { type: "image/jpeg" });
    const nextUrl = URL.createObjectURL(nextFile);
    revokeQueue.current.add(nextUrl);

    const nextImages = [...images];
    const nextFiles = [...files];
    revokePreview(nextImages[activeCropIndex]);
    nextImages[activeCropIndex] = nextUrl;
    nextFiles[activeCropIndex] = nextFile;
    update(nextImages, nextFiles);
    setActiveCropIndex(null);
  };

  const onCropComplete = useCallback(
    (croppedArea: { x: number; y: number; width: number; height: number }, croppedAreaPixelsArg: { x: number; y: number; width: number; height: number }) => {
      if (activeCropIndex === null) return;
      setCroppedAreaPixels((prev) => ({ ...prev, [activeCropIndex]: croppedAreaPixelsArg }));
    },
    [activeCropIndex],
  );

  const activeAspect = currentCrop?.aspectMode === "mobile" && aspect !== 1 ? 1 / aspect : aspect;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {pad(images, max).map((src, i) => (
          <div key={i} className="relative">
            <label
              className={cn(
                "flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-secondary/40 transition hover:border-primary hover:bg-primary/5",
                src && "border-solid border-border"
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
              <div className="absolute inset-2 flex justify-between gap-2">
                <button
                  type="button"
                  onClick={() => startCrop(i)}
                  className="rounded-full bg-card/95 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground shadow-card hover:bg-background"
                >
                  <Crop className="mr-1 inline-block h-3.5 w-3.5" /> Crop
                </button>
                <button
                  type="button"
                  onClick={() => clear(i)}
                  aria-label={`Remove image ${i + 1}`}
                  className="grid h-7 w-7 place-items-center rounded-full bg-card/95 shadow-card hover:bg-sale hover:text-primary-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {i === 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary-foreground">
                Main
              </span>
            )}
          </div>
        ))}
      </div>

      {activeCropIndex !== null && images[activeCropIndex] ? (
        <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold">Crop image {activeCropIndex + 1}</div>
              <div className="text-xs text-muted-foreground">Drag to reposition, pinch/scroll to zoom.</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {desktopMobile ? (
                ["desktop", "mobile"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      const next = [...cropState];
                      next[activeCropIndex] = { ...next[activeCropIndex], aspectMode: mode as "desktop" | "mobile" };
                      setCropState(next);
                    }}
                    className={cn(
                      "rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide",
                      cropState[activeCropIndex].aspectMode === mode
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground",
                    )}
                  >
                    {mode}
                  </button>
                ))
              ) : null}
            </div>
          </div>

          <div className="relative h-72 overflow-hidden rounded-3xl bg-black">
            <Cropper
              image={images[activeCropIndex]}
              crop={currentCrop?.crop ?? { x: 0, y: 0 }}
              zoom={currentCrop?.zoom ?? 1}
              aspect={activeAspect}
              onCropChange={(crop) => {
                if (activeCropIndex === null) return;
                const next = [...cropState];
                next[activeCropIndex] = { ...next[activeCropIndex], crop };
                setCropState(next);
              }}
              onZoomChange={(zoom) => {
                if (activeCropIndex === null) return;
                const next = [...cropState];
                next[activeCropIndex] = { ...next[activeCropIndex], zoom };
                setCropState(next);
              }}
              onCropComplete={onCropComplete}
              cropShape="rect"
              showGrid={true}
              objectFit="horizontal-cover"
            />
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={currentCrop?.zoom ?? 1}
                onChange={(e) => {
                  if (activeCropIndex === null) return;
                  const next = [...cropState];
                  next[activeCropIndex] = { ...next[activeCropIndex], zoom: Number(e.target.value) };
                  setCropState(next);
                }}
                className="w-full"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveCropIndex(null)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyCrop}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
              >
                <Maximize2 className="h-4 w-4" /> Apply crop
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <p className="mt-2 text-xs text-muted-foreground">
        Up to {max} images. First image is used as the main product photo.
      </p>
    </div>
  );
}
