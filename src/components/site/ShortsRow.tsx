import { useEffect, useRef, useState } from "react";
import { ChevronRight, Eye, Heart, Play } from "lucide-react";
import type { ApiVideo } from "@/lib/api-client";

function ShortTile({ video, onOpen, autoFocused }: { video: ApiVideo; onOpen: () => void; autoFocused: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [hovered, setPreview] = useState(false);
  const preview = hovered || autoFocused;
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(localStorage.getItem(`vhx-like-${video.id}`) === "1");
  }, [video.id]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (preview) {
      el.currentTime = 0;
      el.play().catch(() => {});
    } else el.pause();
  }, [preview]);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    if (next) localStorage.setItem(`vhx-like-${video.id}`, "1");
    else localStorage.removeItem(`vhx-like-${video.id}`);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Play short: ${video.title}`}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
      onMouseEnter={() => setPreview(true)}
      onMouseLeave={() => setPreview(false)}
      onFocus={() => setPreview(true)}
      onBlur={() => setPreview(false)}
      data-short
      className={`group relative aspect-[9/16] w-36 shrink-0 snap-start cursor-pointer overflow-hidden rounded-2xl surface-card outline-none ring-primary focus-visible:ring-2 sm:w-44 transition-transform ${preview ? "scale-[1.03] ring-2" : ""}`}
    >
      <img src={video.thumbnail} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
      <video
        ref={ref}
        src={preview ? video.low_quality || video.default_quality_url : undefined}
        muted
        loop
        playsInline
        preload="none"
        className={`absolute inset-0 size-full object-cover transition-opacity ${preview ? "opacity-100" : "opacity-0"}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
      <button
        type="button"
        onClick={toggleLike}
        aria-label={liked ? "Unlike" : "Like"}
        aria-pressed={liked}
        className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-background/60 backdrop-blur"
      >
        <Heart className={`size-4 ${liked ? "fill-primary text-primary" : ""}`} />
      </button>
      {!preview && <Play className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 opacity-80" />}
      <div className="absolute inset-x-2 bottom-2">
        <p className="line-clamp-2 text-xs font-semibold">{video.title}</p>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Eye className="size-3" /> {video.views}
        </p>
      </div>
    </div>
  );
}

export function ShortsRow({
  videos,
  onOpen,
  onViewMore,
}: {
  videos: ApiVideo[];
  onOpen: (index: number) => void;
  onViewMore: () => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(-1);
  const [touch, setTouch] = useState(false);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    setTouch(window.matchMedia("(hover: none)").matches);
    const el = scroller.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.8 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pick = () => {
    const el = scroller.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const center = box.left + box.width / 2;
    let best = -1, dist = Infinity;
    el.querySelectorAll<HTMLElement>("[data-short]").forEach((t, i) => {
      const r = t.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - center);
      if (d < dist) { dist = d; best = i; }
    });
    setFocused(best);
  };

  useEffect(() => {
    if (touch && onScreen) pick();
  }, [touch, onScreen]);

  if (!videos.length) return null;
  return (
    <section aria-label="Shorts" className="my-6">
      <h2 className="mb-3 font-display text-xl font-bold">Shorts</h2>
      <div ref={scroller} onScroll={() => touch && onScreen && pick()} className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
        {videos.map((v, i) => (
          <ShortTile key={v.id} video={v} onOpen={() => onOpen(i)} autoFocused={touch && onScreen && focused === i} />
        ))}
        <button
          type="button"
          onClick={onViewMore}
          className="grid aspect-[9/16] w-36 shrink-0 snap-start place-items-center rounded-2xl surface-card text-sm font-semibold sm:w-44"
        >
          <span className="flex flex-col items-center gap-2">
            <ChevronRight className="size-8 text-primary" /> View more
          </span>
        </button>
      </div>
    </section>
  );
}
