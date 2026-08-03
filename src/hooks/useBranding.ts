import { useQuery } from "@tanstack/react-query";
import { getBranding, defaultBranding, type BrandingSettings } from "@/lib/db/branding";

/** Live brand identity (logos, wordmark) managed from the admin panel. */
export function useBranding(): BrandingSettings {
  const { data } = useQuery({
    queryKey: ["branding"],
    queryFn: getBranding,
    enabled: typeof window !== "undefined",
    staleTime: 30_000,
  });
  return data ?? defaultBranding;
}
