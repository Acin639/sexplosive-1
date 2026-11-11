import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { VideoGrid } from "@/components/site/VideoGrid";
import { MediaLoadState } from "@/components/site/MediaLoadState";
import { fetchHome, fetchSearch } from "@/lib/api-client";
import { findCreatorName } from "@/lib/gallery-media";

export const Route = createFileRoute("/results")({
  validateSearch: (s: Record<string, unknown>) => ({ q: String(s["q"] ?? "") }),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Search results — Sexplosive" },
      { name: "description", content: "Find creator profiles and videos on Sexplosive." },
      { property: "og:title", content: "Search results — Sexplosive" },
      { property: "og:description", content: "Find creator profiles and videos on Sexplosive." },
    ],
  }),
  component: Results,
});

function Results() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const home = useQuery({ queryKey: ["home", 100], queryFn: () => fetchHome(100), enabled: q.length > 0 });
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["search", q],
    queryFn: () => fetchSearch(q, { pages: 3, limit: 20 }),
    enabled: q.length > 0,
  });
  const creator = findCreatorName(q, [...(home.data?.videos ?? []), ...(data?.videos ?? [])]);
  useEffect(() => {
    if (creator) navigate({ to: "/creator/$name", params: { name: creator }, replace: true });
  }, [creator, navigate]);

  return (
    <SiteLayout>
      <h1 className="mb-1 font-display text-xl font-bold sm:text-2xl">Results for “{q}”</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        {isPending && q ? "Searching…" : `${data?.videos.length ?? 0} videos`}
      </p>
      <MediaLoadState pending={Boolean(q) && isPending} error={error} retry={() => refetch()} />
      {!isPending && !error && <VideoGrid key={q} videos={data?.videos ?? []} />}
    </SiteLayout>
  );
}
