import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MediaLoadState } from "@/components/site/MediaLoadState";
import { fetchSearch } from "@/lib/api-client";
import { buildLegends, legendSlug } from "@/lib/legends";
import { useCustomLegends } from "@/lib/custom-content";


export const Route = createFileRoute("/legends/")({
  head: () => ({ meta: [
    { title: "Legends — Sexplosive" },
    { name: "description", content: "Meet the legends of Sexplosive: profiles, pictures and videos." },
    { property: "og:title", content: "Legends — Sexplosive" },
    { property: "og:description", content: "Profiles, pictures and videos of Sexplosive legends." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Legends,
});

function Legends() {
  const { data, isPending, error, refetch } = useQuery({ queryKey: ["legends"], queryFn: () => fetchSearch("legends", { pages: 3, limit: 60 }) });
  const custom = useCustomLegends();
  const built = buildLegends(data?.videos ?? []);
  const customSlugs = new Set(custom.map((c) => legendSlug(c.name)));
  const legends = [
    ...custom.map((c) => ({ name: c.name, slug: legendSlug(c.name), avatar: c.avatar, videos: built.find((b) => b.slug === legendSlug(c.name))?.videos ?? [] })),
    ...built.filter((b) => !customSlugs.has(b.slug)),
  ];
  return <SiteLayout>
    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Hall of fame</p>
    <h1 className="mb-6 mt-1 font-display text-3xl font-bold sm:text-4xl glow-text">Legends</h1>
    <MediaLoadState pending={isPending} error={error} retry={() => refetch()} />
    {(legends.length > 0 || (!isPending && !error)) && (legends.length === 0 ? <p className="text-muted-foreground">No legends yet.</p> :
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {legends.map(l => <Link key={l.slug} to="/legends/$name" params={{ name: l.slug }} className="group overflow-hidden rounded-md surface-card">
          <img src={l.avatar} alt={l.name} loading="lazy" className="aspect-[3/4] w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" />
          <div className="p-3">
            <p className="truncate font-display font-semibold">{l.name}</p>
            {l.videos.length > 0 && <p className="text-xs text-muted-foreground">{l.videos.length} video{l.videos.length === 1 ? "" : "s"}</p>}
          </div>
        </Link>)}
      </div>)}
  </SiteLayout>;
}
