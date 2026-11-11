import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { fetchHome } from "@/lib/api-client";
import { categoryCatalog } from "@/lib/category-catalog";
import { MediaLoadState } from "@/components/site/MediaLoadState";
import { ImageCollection } from "@/components/site/ImageCollection";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [
    { title: "Gallery — Sexplosive" },
    { name: "description", content: "Explore and download images from the Sexplosive video collection." },
    { property: "og:title", content: "Gallery — Sexplosive" },
    { property: "og:description", content: "Explore and download images from the Sexplosive video collection." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Gallery,
});

function Gallery() {
  const { data, isPending, error, refetch } = useQuery({ queryKey: ["home", 21], queryFn: () => fetchHome(21) });
  const categories = categoryCatalog().filter(category => category.slug !== "gallery");
  const videos = data?.videos ?? [];
  const hero = videos.slice(0, 3);
  return <SiteLayout>
    <header className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Gallery</p>
      <h1 className="mt-1 font-display text-3xl font-bold leading-tight sm:text-5xl">Stills worth keeping.</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">Browse collections, open any picture full screen and download it. Use the search at the top to find pictures.</p>
    </header>
    <MediaLoadState pending={isPending} error={error} retry={() => refetch()} />
    {!isPending && !error && <>
      {hero.length === 3 && <div className="mb-8 grid h-64 grid-cols-3 grid-rows-2 gap-2 sm:h-96">
        {hero.map((v, i) => <img key={v.id} src={v.thumbnail} alt={v.title} className={`size-full rounded-sm bg-surface object-contain ${i === 0 ? "col-span-2 row-span-2" : ""}`} />)}
      </div>}
      <section className="mb-10">
        <h2 className="mb-3 font-display text-lg font-bold">Collections</h2>
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
          {categories.map((category, index) => {
            const cover = videos[index % (videos.length || 1)]?.thumbnail ?? category.image;
            return <Link key={category.slug} to="/gallery/$category" params={{ category: category.slug }} aria-label={`Open ${category.title} images`} className="group relative w-36 shrink-0 snap-start overflow-hidden rounded-sm bg-surface sm:w-44">
              {cover ? <img src={cover} alt={category.title} loading="lazy" className="aspect-[3/4] w-full object-contain" /> : <div className="aspect-[3/4] w-full bg-secondary" />}
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-background/90 to-transparent p-3 pt-10">
                <span className="truncate font-display text-sm font-semibold">{category.title}</span>
                <ArrowUpRight className="size-4 shrink-0 text-accent" />
              </span>
            </Link>;
          })}
        </div>
      </section>
      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Latest pictures</h2>
        <ImageCollection videos={videos} />
      </section>
    </>}
  </SiteLayout>;
}
