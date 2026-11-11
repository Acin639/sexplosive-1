import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Images } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ImageCollection } from "@/components/site/ImageCollection";
import { MediaLoadState } from "@/components/site/MediaLoadState";
import { categoryCatalog } from "@/lib/category-catalog";
import { fetchSearch } from "@/lib/api-client";

export const Route = createFileRoute("/gallery_/$category")({
  head: ({ params }) => {
    const title = categoryCatalog().find(category => category.slug === params.category)?.title ?? params.category;
    return { meta: [
      { title: `${title} images — Sexplosive Gallery` },
      { name: "description", content: `Browse ${title} images and slideshows on Sexplosive.` },
      { property: "og:title", content: `${title} images — Sexplosive Gallery` },
      { property: "og:description", content: `Browse the ${title} image collection.` },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    ] };
  },
  component: CategoryImages,
});
function CategoryImages() {
  const { category } = Route.useParams();
  const title = categoryCatalog().find(item => item.slug === category)?.title ?? category;
  const { data, isPending, error, refetch } = useQuery({ queryKey: ["gallery", category], queryFn: () => fetchSearch(title, { pages: 3, limit: 60 }) });
  return <SiteLayout>
    <h1 className="mb-6 flex items-center gap-3 text-2xl font-bold"><Images /> {title}</h1>
    <MediaLoadState pending={isPending} error={error} retry={() => refetch()} />
    {data && !error && <ImageCollection key={category} videos={data.videos} />}
  </SiteLayout>;
}