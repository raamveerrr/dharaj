import { useQuery } from "@tanstack/react-query";
import { getHomepage, type HomepageContent } from "@/lib/db/catalog";

/**
 * Storefront homepage content (banners, shortcuts, announcements) managed from
 * the admin panel. Falls back to empty homepage sections when data is missing.
 */
export function useHomepageContent(): HomepageContent {
  const { data } = useQuery({
    queryKey: ["homepage"],
    queryFn: getHomepage,
    enabled: typeof window !== "undefined",
    staleTime: 60_000,
  });
  return (
    data ?? {
      banners: [],
      shortcuts: [],
      announcements: [],
      featuredProducts: [],
      featuredCategories: [],
      settings: { shortcuts: [] },
    }
  );
}
