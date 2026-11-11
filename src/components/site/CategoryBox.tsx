import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Images, Lock } from "lucide-react";
import { img } from "@/lib/mock-data";
import { categoryCatalog, visibleCategoryCount } from "@/lib/category-catalog";
import type { ApiVideo } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export function CategoryBox({ withLeaks = false, videos = [] }: { withLeaks?: boolean; videos?: ApiVideo[] }) {
  const [expanded, setExpanded] = useState(false);
  const categories = categoryCatalog(withLeaks);
  return (
    <section className="rounded-3xl surface-card p-5 sm:p-7">
      <h2 className="mb-5 font-display text-lg font-bold sm:text-2xl">Browse categories</h2>
      <div id="category-cards" className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
        {categories.map((c, i) => {
          const cover = videos.length ? videos[i % videos.length]?.thumbnail : undefined;
          const card = <><div className="aspect-[5/4] w-full overflow-hidden"><img src={cover ?? c.image ?? img(c.seed, 640, 512)} alt="" loading="lazy" width={640} height={512} className="size-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-105" /></div><div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-background via-background/80 to-transparent p-4">{c.slug === "gallery" && <Images className="size-5 shrink-0" />}{c.slug === "premium" && <Lock className="size-5 shrink-0" />}<p className="text-sm font-semibold sm:text-base">{c.title}</p></div></>;
          const classes = `group relative overflow-hidden rounded-2xl border border-border ${i >= visibleCategoryCount(expanded, 2, categories.length) ? (i < visibleCategoryCount(expanded, 4, categories.length) ? "hidden sm:block" : "hidden") : ""}`;
          return c.slug === "gallery" ? <Link key={c.slug} to="/gallery" className={classes}>{card}</Link> : c.slug === "legends" ? <Link key={c.slug} to="/legends" className={classes}>{card}</Link> : c.slug === "premium" ? <Link key={c.slug} to="/premium" className={classes}>{card}</Link> : <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className={classes}>{card}</Link>;
        })}
      </div>
      <div className="mt-6 flex items-center gap-4 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border"><Button variant="outline" className="h-12 gap-3 rounded-lg border-accent/40 bg-accent/5 px-5 text-sm font-semibold text-accent hover:border-accent" aria-label={expanded ? "Collapse categories" : "Expand categories"} title={expanded ? "Collapse categories" : "Expand categories"} aria-expanded={expanded} aria-controls="category-cards" onClick={() => setExpanded(!expanded)}>{expanded ? <ChevronUp className="size-6" /> : <ChevronDown className="size-6" />}<span>{expanded ? "Show less" : "Show more"}</span></Button></div>
    </section>
  );
}
