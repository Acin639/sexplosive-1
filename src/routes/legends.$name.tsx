import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MediaLoadState } from "@/components/site/MediaLoadState";
import { ImageCollection } from "@/components/site/ImageCollection";
import { VideoGrid } from "@/components/site/VideoGrid";
import { fetchSearch } from "@/lib/api-client";
import { buildLegends, legendImageCount, legendSlug } from "@/lib/legends";
import { useCustomLegends } from "@/lib/custom-content";

export const Route = createFileRoute("/legends/$name")({
  head: ({ params }) => {
    const name = params.name.replace(/-/g, " ");
    return { meta: [
      { title: `${name} — Legends — Sexplosive` },
      { name: "description", content: `Profile, pictures and videos of ${name} on Sexplosive.` },
      { property: "og:title", content: `${name} — Sexplosive Legends` },
      { property: "og:description", content: `Profile, pictures and videos of ${name}.` },
      { property: "og:type", content: "profile" }, { name: "twitter:card", content: "summary_large_image" },
    ] };
  },
  component: LegendInfo,
});

const TABS = ["images", "videos"] as const;

function LegendInfo() {
  const { name } = Route.useParams();
  const { data, isPending, error, refetch } = useQuery({ queryKey: ["legends"], queryFn: () => fetchSearch("legends", { pages: 3, limit: 60 }) });
  const custom = useCustomLegends().find(c => legendSlug(c.name) === name);
  const { data: own } = useQuery({ queryKey: ["legend-videos", custom?.name], enabled: !!custom, queryFn: () => fetchSearch(custom?.name ?? "", { pages: 1, limit: 40 }) });
  const found = buildLegends(data?.videos ?? []).find(l => l.slug === name);
  const legend = custom
    ? { name: custom.name, slug: name, avatar: custom.avatar, videos: found?.videos.length ? found.videos : own?.videos ?? [] }
    : found;
  const [tab, setTab] = useState<(typeof TABS)[number]>("images");

  return <SiteLayout>
    <MediaLoadState pending={isPending} error={error} retry={() => refetch()} />
    {!isPending && !error && !legend && !custom && <p className="text-muted-foreground">This legend could not be found.</p>}
    {legend && <>
      <section className="flex items-center gap-4">
        <img src={legend.avatar} alt={legend.name} className="size-20 shrink-0 rounded-full bg-secondary object-contain ring-2 ring-accent/60 sm:size-24" />
        <div className="min-w-0">
          <h1 className="break-words font-display text-2xl font-extrabold leading-tight sm:text-3xl glow-text">{legend.name}</h1>
          <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs">
            {[
              ["Nationality", custom?.nationality || "Not specified"],
              ["Ethnicity", custom?.ethnicity || "Not specified"],
              ["Age", custom?.age || "Not specified"],
            ].map(([k, v]) => <div key={k} className="flex gap-1"><dt className="text-muted-foreground">{k}:</dt><dd className="font-semibold">{v}</dd></div>)}
          </dl>
          <p className="mt-1 text-xs text-muted-foreground">{legendImageCount(legend)} images · {legend.videos.length} videos</p>
        </div>
      </section>

      <nav className="relative mt-4 grid grid-cols-2 border-b border-border" role="tablist">
        {TABS.map(t => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`py-3 text-sm font-semibold capitalize transition-colors ${tab === t ? "text-foreground" : "text-muted-foreground"}`}>{t}</button>)}
        <span className="absolute bottom-0 left-0 h-0.5 w-1/2 bg-accent transition-transform duration-300" style={{ transform: `translateX(${tab === "images" ? 0 : 100}%)` }} />
      </nav>
      <div className="overflow-hidden">
        <div className="flex w-[200%] transition-transform duration-500 ease-out" style={{ transform: `translateX(${tab === "images" ? 0 : -50}%)` }}>
          <div className="w-1/2 min-w-0 pt-5 pr-1" aria-hidden={tab !== "images"}><ImageCollection videos={legend.videos} /></div>
          <div className="w-1/2 min-w-0 pt-5 pl-1" aria-hidden={tab !== "videos"}><VideoGrid videos={legend.videos} loading={false} error={null} /></div>
        </div>
      </div>
    </>}
  </SiteLayout>;
}
