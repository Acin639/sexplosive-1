import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronDown, Film, Images, Link2, Play, UserRound } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ImageCollection } from "@/components/site/ImageCollection";
import { TikTokFeed } from "@/components/site/TikTokFeed";
import { MediaLoadState } from "@/components/site/MediaLoadState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fetchHome, fetchSearch, type ApiVideo } from "@/lib/api-client";
import { creatorVideos, galleryImages } from "@/lib/gallery-media";
import { MediaSearch } from "@/components/site/MediaSearch";

export const Route = createFileRoute("/creator/$name")({
  head: ({ params }) => ({ meta: [
    { title: `${params.name} — Sexplosive creator` },
    { name: "description", content: `View ${params.name}'s images, videos and creator details.` },
    { property: "og:title", content: `${params.name} — Sexplosive creator` },
    { property: "og:description", content: `Browse images and videos from ${params.name}.` },
    { property: "og:type", content: "profile" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Creator,
});
function Creator() {
  const { name } = Route.useParams();
  const [details, setDetails] = useState(false);
  const [feed, setFeed] = useState<ApiVideo[] | null>(null);
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["creator", name],
    queryFn: async () => {
      const [home, search] = await Promise.all([fetchHome(100), fetchSearch(name, { pages: 3, limit: 100 })]);
      return creatorVideos(name, [...home.videos, ...search.videos]);
    },
  });
  const videos = data ?? [];
  const images = galleryImages(videos);
  return <SiteLayout>
    <section className="mb-7 border-b border-border pb-6">
      <div className="flex items-center gap-5">
        <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-accent bg-secondary sm:size-32"><UserRound className="size-12 text-muted-foreground" /></div>
        <div className="min-w-0"><h1 className="break-words text-2xl font-bold">{name}</h1><div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground"><span>{isPending ? "…" : videos.length} videos</span><span>{isPending ? "…" : images.length} images</span></div></div>
      </div>
      <Button variant="ghost" aria-expanded={details} aria-controls="creator-details" className="mt-4" onClick={() => setDetails(!details)}>More details <ChevronDown className={details ? "rotate-180" : ""} /></Button>
      {details && <dl id="creator-details" className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">{["Ethnicity", "Hair", "Height", "Age"].map(label => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-sm">Not provided</dd></div>)}</dl>}
    </section>
    <MediaSearch videos={videos} />
    <MediaLoadState pending={isPending} error={error} retry={() => refetch()} />
    <Tabs defaultValue="images" className="overflow-hidden">
      <TabsList className="mb-5 grid h-12 w-full grid-cols-3 rounded-lg"><TabsTrigger value="socials"><Link2 className="mr-2 size-4" /> Socials</TabsTrigger><TabsTrigger value="images"><Images className="mr-2 size-4" /> Images</TabsTrigger><TabsTrigger value="videos"><Film className="mr-2 size-4" /> Videos</TabsTrigger></TabsList>
      <TabsContent value="socials" className="motion-safe:animate-in motion-safe:slide-in-from-right-4 motion-safe:duration-300"><p className="py-10 text-muted-foreground">No social links provided.</p></TabsContent>
      <TabsContent value="images" className="motion-safe:animate-in motion-safe:slide-in-from-right-4 motion-safe:duration-300">{!isPending && !error && <ImageCollection videos={videos} />}</TabsContent>
      <TabsContent value="videos" className="motion-safe:animate-in motion-safe:slide-in-from-right-4 motion-safe:duration-300"><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{videos.map((video, index) => <Button key={video.id} variant="ghost" className="relative h-auto min-w-0 overflow-hidden rounded-lg p-0" aria-label={`Play ${video.title}`} onClick={() => setFeed([...videos.slice(index), ...videos.slice(0, index)])}><img src={video.thumbnail} alt={video.title} loading="lazy" className="aspect-[9/16] w-full object-cover" /><Play className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2" /><span className="absolute inset-x-0 bottom-0 bg-background/80 px-3 py-2 text-left text-xs">{video.views}</span></Button>)}</div>{!isPending && !error && !videos.length && <p className="py-10 text-muted-foreground">No videos available.</p>}</TabsContent>
    </Tabs>
    {feed && <TikTokFeed videos={feed} onClose={() => setFeed(null)} />}
  </SiteLayout>;
}