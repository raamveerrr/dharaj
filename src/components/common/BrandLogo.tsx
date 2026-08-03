import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBranding } from "@/hooks/useBranding";
import type { BrandingSettings } from "@/lib/db/branding";

type Slot = "header" | "drawer" | "footer" | "admin";

export function resolveLogo(branding: BrandingSettings, slot: Slot): string {
  const map: Record<Slot, string> = {
    header: branding.headerLogoUrl,
    drawer: branding.drawerLogoUrl,
    footer: branding.footerLogoUrl,
    admin: branding.adminLogoUrl,
  };
  return map[slot] || branding.headerLogoUrl || "";
}

/** Presentational brand lockup — used by BrandLogo and the admin live preview. */
export function BrandLockup({
  branding,
  slot,
  className,
  fallbackClassName,
  wordmarkClassName,
  height,
}: {
  branding: BrandingSettings;
  slot: Slot;
  className?: string;
  fallbackClassName?: string;
  wordmarkClassName?: string;
  height?: number;
}) {
  const src = resolveLogo(branding, slot);
  const size = height ?? branding.logoHeight ?? 36;

  return (
    <span className={cn("flex items-center gap-2", className)}>
      {src ? (
        <img
          src={src}
          alt={branding.altText || branding.wordmark || "Logo"}
          style={{ height: size }}
          className="w-auto max-w-[180px] object-contain"
        />
      ) : (
        <span
          style={{ height: size, width: size }}
          className={cn(
            "grid shrink-0 place-items-center rounded-full bg-primary text-primary-foreground",
            fallbackClassName,
          )}
        >
          <Leaf style={{ height: size * 0.55, width: size * 0.55 }} />
        </span>
      )}
      {branding.showWordmark && branding.wordmark ? (
        <span
          className={cn(
            "text-xl font-extrabold tracking-tight text-primary",
            wordmarkClassName,
          )}
        >
          {branding.wordmark}
        </span>
      ) : null}
    </span>
  );
}

/** Live brand lockup wired to the admin-managed branding document. */
export function BrandLogo(props: Omit<Parameters<typeof BrandLockup>[0], "branding">) {
  const branding = useBranding();
  return <BrandLockup branding={branding} {...props} />;
}
