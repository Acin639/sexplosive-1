import { CATEGORY_PAGES, LEAKS_CATEGORY, type Category } from "@/lib/mock-data";
import galleryImage from "@/assets/category-gallery.jpg";
import premiumImage from "@/assets/category-premium.jpg";
import legendsImage from "@/assets/category-legends.jpg";

export const FEATURED_CATEGORIES = [
  { slug: "gallery", title: "Gallery", seed: "gallery", image: galleryImage },
  { slug: "premium", title: "Premium", seed: "premium", image: premiumImage },
  { slug: "legends", title: "Legends", seed: "legends", image: legendsImage },
];
export function categoryCatalog(withLeaks = false): (Category & { image?: string })[] {
  return [...FEATURED_CATEGORIES, ...(withLeaks ? [LEAKS_CATEGORY] : []), ...CATEGORY_PAGES.flat()];
}
export function visibleCategoryCount(expanded: boolean, columns: number, total: number) {
  return expanded ? total : Math.min(Math.max(6, columns * 2), total);
}
