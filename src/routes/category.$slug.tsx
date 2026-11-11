import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { VideoGrid } from "@/components/site/VideoGrid";
import { fetchSearch } from "@/lib/api-client";

export const Route = createFileRoute("/category/$slug")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Category — Sexplosive" },
      { name: "description", content: "Browse a curated Sexplosive category of videos." },
      { property: "og:title", content: "Category — Sexplosive" },
      { property: "og:description", content: "Browse a curated Sexplosive category of videos." },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const title = slug.replace(/-/g, " ");

  const { data, isPending, error } = useQuery({
    queryKey: ["category", slug],
    queryFn: () => fetchSearch(title, { pages: 3, limit: 20 }),
  });

  return (
    <SiteLayout>
      <div className="mb-5 flex items-center gap-3">
        <h1 className="truncate font-display text-xl font-bold capitalize sm:text-2xl">{title}</h1>
      </div>
      <VideoGrid
        videos={data?.videos ?? []}
        loading={isPending}
        error={error ? error.message : null}
        skeletonCount={12}
      />
    </SiteLayout>
  );
}
