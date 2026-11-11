import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HeroSlider } from "@/components/site/HeroSlider";
import { CategoryBox } from "@/components/site/CategoryBox";
import { VideoCard, VideoGrid } from "@/components/site/VideoGrid";
import { ShortsRow } from "@/components/site/ShortsRow";
import { fetchHome, type ApiVideo } from "@/lib/api-client";
import { useState } from "react";
import { Play, MoveVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TikTokFeed } from "@/components/site/TikTokFeed";
import { AdSlot } from "@/components/site/AdSlot";
import { ConsentGate } from "@/components/site/ConsentGate";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Sexplosive — Stream, Connect & Go Live" },
      {
        name: "description",
        content:
          "Sexplosive is a next-gen tube platform: trending videos, live rooms, premium streamers and instant connect.",
      },
      { property: "og:title", content: "Sexplosive — Stream, Connect & Go Live" },
      {
        property: "og:description",
        content: "Trending videos, live rooms, premium streamers and instant connect.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data, isPending, error } = useQuery({
    queryKey: ["home", 21],
    queryFn: () => fetchHome(21),
  });
  const [tiktok, setTiktok] = useState<ApiVideo[] | null>(null);

  return (
    <SiteLayout>
      <div className="space-y-8">
        <HeroSlider />
        <AdSlot slot="home-top" />
        <CategoryBox videos={data?.videos} />
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-display text-2xl font-bold sm:text-3xl glow-text">Today's selection</h1>
            <Button
              variant="outline"
              className="group h-12 gap-3 rounded-lg border-accent/50 bg-accent/5 px-4 text-foreground hover:border-accent"
              disabled={!data?.videos?.length}
              onClick={() => data?.videos && setTiktok(data.videos)}
            >
              <span className="grid size-7 place-items-center rounded-md bg-accent text-accent-foreground"><Play className="size-4 fill-current" /></span> TikTok mode <MoveVertical className="text-accent" />
            </Button>
          </div>
          {!data?.videos?.length ? (
            <VideoGrid videos={[]} loading={isPending} error={error ? error.message : null} skeletonCount={12} />
          ) : (
            Array.from({ length: Math.ceil(data.videos.length / 3) }).map((_, g) => {
              const all = data.videos;
              const chunk = all.slice(g * 3, g * 3 + 3);
              const shorts = [...all.slice((g * 5) % all.length), ...all.slice(0, (g * 5) % all.length)];
              return (
                <div key={g}>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {chunk.map((v) => <VideoCard key={v.id} video={v} allVideos={all} />)}
                  </div>
                  {g * 3 + 3 < all.length && (
                    <ShortsRow
                      videos={shorts}
                      onOpen={(i) => setTiktok([...shorts.slice(i), ...shorts.slice(0, i)])}
                      onViewMore={() => setTiktok(shorts)}
                    />
                  )}
                  {g === 1 && <AdSlot slot="home-feed" />}
                  {g * 3 + 3 >= all.length && <div className="h-5" />}
                </div>
              );
            })
          )}
        </section>
      </div>
      <ConsentGate />
      {tiktok && <TikTokFeed videos={tiktok} onClose={() => setTiktok(null)} />}
    </SiteLayout>
  );
}
