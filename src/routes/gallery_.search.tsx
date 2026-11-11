import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ImageCollection } from "@/components/site/ImageCollection";
import { MediaLoadState } from "@/components/site/MediaLoadState";
import { fetchSearch } from "@/lib/api-client";

export const Route = createFileRoute("/gallery_/search")({
  validateSearch: (s: Record<string, unknown>) => ({ q: String(s["q"] ?? "") }),
  head: () => ({ meta: [
    { title: "Picture search — Sexplosive Gallery" },
    { name: "description", content: "Search and download pictures in the Sexplosive gallery." },
    { property: "og:title", content: "Picture search — Sexplosive Gallery" },
    { property: "og:description", content: "Search and download pictures in the Sexplosive gallery." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: PictureSearch,
});

function PictureSearch() {
  const { q } = Route.useSearch();
  const { data, isPending, error, refetch } = useQuery({ queryKey: ["gallery-search", q], queryFn: () => fetchSearch(q, { pages: 3, limit: 60 }), enabled: q.length > 0 });
  return <SiteLayout>
    <h1 className="mb-6 font-display text-2xl font-bold sm:text-3xl">Pictures for “{q}”</h1>
    {q && <MediaLoadState pending={isPending} error={error} retry={() => refetch()} />}
    {data && !error && <ImageCollection key={q} videos={data.videos} />}
  </SiteLayout>;
}
