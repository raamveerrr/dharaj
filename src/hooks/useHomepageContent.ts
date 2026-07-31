import { useQuery } from "@tanstack/react-query";
import { getHomepage, defaultHomepage, type HomepageContent } from "@/lib/db/catalog";

/**
 * Storefront homepage content (banners, shortcuts, announcements) managed from
 * the admin panel. Falls back to the bundled defaults during SSR / errors.
 */
export function useHomepageContent(): HomepageContent {
  const { data } = useQuery({
    queryKey: ["homepage"],
    queryFn: getHomepage,
    enabled: typeof window !== "undefined",
    staleTime: 60_000,
  });
  return data ?? defaultHomepage;
}
