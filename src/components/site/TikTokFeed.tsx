import { AdMedia } from "./AdSlot";
import { trackAd } from "@/lib/ads";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { adAfter, useSlotAd, type Ad } from "@/lib/ads";
import { Spinner } from "./Spinner";
import { Link } from "@tanstack/react-router";
import {
  Bookmark,
  ChevronRight,
  Eye,
  Forward,
  Heart,
  MonitorPlay,
  Music2,
  Play,
  Plus,
  Search,
  UserRound,
  Volume2,
  VolumeX,
  X,
  ChevronsRight,
} from "lucide-react";
import { toast } from "sonner";
import { siteUrl, copyOrShare } from "@/lib/share";
import type { ApiVideo } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { slug: "shorts", title: "Shorts" },
  { slug: "for-you", title: "For You" },
  { slug: "trending", title: "Trending" },
];

const railButton =
  "h-auto rounded-full bg-transparent p-0 text-feed-foreground shadow-none hover:bg-transparent hover:text-feed-foreground/75 focus-visible:text-feed-foreground [&_svg]:size-8";

function seconds(iso: string) {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso ?? "");
  return m ? (Number(m[1]) || 0) * 3600 + (Number(m[2]) || 0) * 60 + (Number(m[3]) || 0) : Number.POSITIVE_INFINITY;
}

function viewsOf(views: string) {
  const n = Number.parseInt((views ?? "").replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

function searchQueryOf(title: string) {
  const words = (title ?? "").trim().split(/\s+/).slice(0, 6).join(" ");
  return words.length > 44 ? `${words.slice(0, 44)}…` : words;
}

export function TikTokFeed({ videos, onClose }: { videos: ApiVideo[]; onClose: () => void }) {
  const [muted, setMuted] = useState(true);
  const [cat, setCat] = useState("for-you");
  const [active, setActive] = useState<ApiVideo | null>(videos[0] ?? null);
  const [panel, setPanel] = useState<"music" | "profile" | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  const lists = useMemo(() => {
    const short = videos
      .filter((v) => seconds(v.duration) <= 150)
      .sort((a, b) => seconds(a.duration) - seconds(b.duration));
    return {
      shorts: short.length >= 3 ? short : [...videos].sort((a, b) => seconds(a.duration) - seconds(b.duration)),
      "for-you": videos,
      trending: [...videos].sort((a, b) => viewsOf(b.views) - viewsOf(a.views)),
    } as Record<string, ApiVideo[]>;
  }, [videos]);

  const list = lists[cat] ?? videos;

  const pickCategory = (slug: string) => {
    setCat(slug);
    setPanel(null);
    scroller.current?.scrollTo({ top: 0 });
  };

  const feedAd = useSlotAd("tiktok");
  const jump = (i: number) => {
    const el = scroller.current;
    const pos = feedAd ? i + Math.floor(i / Math.max(1, feedAd.frequency ?? 3)) : i;
    if (el && i < list.length) el.scrollTo({ top: el.clientHeight * pos, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="TikTok video feed" className="fixed left-0 top-0 z-[100] h-dvh w-screen overflow-hidden bg-feed text-feed-foreground" onKeyDown={e => {
      if (e.key === "Escape") { e.stopPropagation(); panel ? setPanel(null) : onClose(); }
      if (e.key === "Tab") {
        const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input'));
        const first = buttons[0]; const last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }}>
      {/* Floating header, laid over the video like TikTok's tab bar */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center gap-2 px-3 pb-1 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <nav aria-label="Feed categories" className="flex min-w-0 flex-1 items-center justify-center gap-3 sm:gap-6">
          {CATEGORIES.map(c => (
            <button
              key={c.slug}
              type="button"
              aria-pressed={cat === c.slug}
              onClick={() => pickCategory(c.slug)}
              className={cn(
                "relative shrink-0 pb-2 font-display text-base font-semibold transition-colors sm:text-lg",
                cat === c.slug ? "text-feed-foreground" : "text-feed-muted hover:text-feed-foreground/80",
              )}
            >
              {c.title}
              {cat === c.slug && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 mx-auto h-[3px] w-9 rounded-full bg-feed-foreground" />}
            </button>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon" className="size-10 rounded-full text-feed-foreground hover:bg-feed-foreground/10 hover:text-feed-foreground [&_svg]:size-6" aria-label={muted ? "Unmute" : "Mute"} title={muted ? "Unmute" : "Mute"} onClick={() => setMuted(!muted)}>{muted ? <VolumeX /> : <Volume2 />}</Button>
          <Button ref={closeRef} variant="ghost" size="icon" className="size-10 rounded-full text-feed-foreground hover:bg-feed-foreground/10 hover:text-feed-foreground [&_svg]:size-6" aria-label="Exit TikTok mode" title="Close" onClick={onClose}><X /></Button>
        </div>
      </header>

      {!list.length && <div className="grid h-full place-items-center text-feed-muted">No videos in this category.</div>}

      <div ref={scroller} className="h-dvh w-screen snap-y snap-mandatory overflow-x-hidden overflow-y-scroll overscroll-contain scrollbar-none">
        {list.map((v, i) => <Fragment key={`${cat}-${v.id}`}><FeedItem video={v} category={cat} muted={muted} blocked={!!panel} onActive={() => setActive(v)} onProfile={() => { setActive(v); setPanel("profile"); }} onMusic={() => { setActive(v); setPanel("music"); }} onEnded={() => jump(i + 1)} />{feedAd && adAfter(i, feedAd.frequency) && <FeedAd ad={feedAd} onSkip={() => jump(i + 1)} />}</Fragment>)}
      </div>

      {panel && <div className="absolute inset-0 z-30 flex items-end justify-center bg-feed/70 backdrop-blur-sm" onClick={() => setPanel(null)}>
        <section role="dialog" aria-label={panel === "music" ? "Original sound" : "Creator profile"} className="relative max-h-[65dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-popover p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-popover-foreground" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="absolute right-3 top-3" aria-label="Close details" onClick={() => setPanel(null)}><X /></Button>
          {panel === "music" ? <><Music2 className="mb-3 size-8 text-accent" /><h2 className="pr-8 font-display text-xl font-bold">Original sound</h2><p className="mt-2 break-words text-muted-foreground">{active?.uploader || "Unknown creator"}</p><p className="mt-1 break-words text-sm">{active?.title}</p><Button className="mt-5" onClick={() => { setMuted(false); setPanel(null); }}><Volume2 /> Listen</Button></> : <><div className="mb-3 grid size-16 place-items-center rounded-full border border-primary bg-secondary"><UserRound className="size-8" /></div><h2 className="break-words pr-8 font-display text-xl font-bold">{active?.uploader || "Unknown creator"}</h2><div className="mt-5 space-y-3">{list.map((v, i) => v.uploader === active?.uploader ? <Button variant="ghost" key={`${v.id}-${i}`} className="h-auto w-full justify-start whitespace-normal text-left" onClick={() => { setPanel(null); jump(i); }}><img src={v.thumbnail} alt="" className="aspect-video w-20 rounded object-cover" /><span className="min-w-0 break-words">{v.title}</span></Button> : null)}</div></>}
        </section>
      </div>}
    </div>
  );
}

function FeedItem({ video, category, muted, blocked, onActive, onProfile, onMusic, onEnded }: { video: ApiVideo; category: string; muted: boolean; blocked: boolean; onActive: () => void; onProfile: () => void; onMusic: () => void; onEnded: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const activeCallback = useRef(onActive);
  activeCallback.current = onActive;
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [buffering, setBuffering] = useState(true);

  useEffect(() => {
    try {
      setLiked(localStorage.getItem(`vhx-like-${video.id}`) === "1");
      setSaved(localStorage.getItem(`vhx-bookmark-${video.id}`) === "1");
    } catch {}
  }, [video.id]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) activeCallback.current();
      else { vid.current?.pause(); setPaused(false); }
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (visible && !blocked && !paused) v.play().catch(() => setPaused(true));
    else v.pause();
  }, [visible, blocked, paused, muted]);

  const toggleAction = (kind: "like" | "bookmark", value: boolean) => {
    const next = !value;
    kind === "like" ? setLiked(next) : setSaved(next);
    try { localStorage.setItem(`vhx-${kind}-${video.id}`, next ? "1" : "0"); }
    catch { toast.error("Your browser could not remember this action"); }
  };
  const share = async () => {
    const url = siteUrl(`/watch/${encodeURIComponent(video.id)}`);
    try { sessionStorage.setItem(`vhxtube-video-${video.id}`, JSON.stringify(video)); } catch { /* ignore */ }
    try { if ((await copyOrShare(video.title, url)) === "copied") toast.success("Link copied"); }
    catch { toast.error("Could not share this video"); }
  };
  const hashtags = video.hashtags?.length ? video.hashtags.map(tag => `#${tag.replace(/^#/, "").replace(/\s+/g, "")}`) : ["#vhxtube", `#${category.replace(/-/g, "")}`];

  const seek = (value: number) => {
    const v = vid.current;
    if (!v || !Number.isFinite(v.duration)) return;
    v.currentTime = (value / 100) * v.duration;
    setProgress(value);
  };

  return <div ref={wrap} className="relative h-dvh w-screen shrink-0 snap-start snap-always overflow-hidden bg-feed">
    <video ref={vid} src={video.default_quality_url} poster={video.thumbnail} muted={muted} playsInline preload={visible ? "auto" : "metadata"} onError={() => { setFailed(true); setBuffering(false); }} onWaiting={() => setBuffering(true)} onCanPlay={() => setBuffering(false)} onPlaying={() => setBuffering(false)} onClick={() => setPaused(!paused)} onEnded={onEnded} onTimeUpdate={e => { const v = e.currentTarget; if (v.duration) setProgress(v.currentTime / v.duration * 100); }} className="absolute inset-0 size-full object-cover" />
    {visible && buffering && !failed && !paused && <div className="pointer-events-none absolute inset-0 z-[5] grid place-items-center"><Spinner label="Loading video" /></div>}

    {/* Scrims keep the overlaid text readable without covering the video */}
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-feed/60 to-transparent" />
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-feed/60 to-transparent" />

    {paused && !failed && <Button variant="ghost" size="icon" aria-label="Play video" className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-feed/45 text-feed-foreground hover:bg-feed/60 [&_svg]:size-10" onClick={() => setPaused(false)}><Play /></Button>}
    {failed && <p role="alert" className="absolute inset-x-4 top-1/2 -translate-y-1/2 text-center text-feed-foreground">This video is unavailable.</p>}

    {/* Caption, action rail, search pill and scrubber overlay the video */}
    <div className="absolute inset-x-0 bottom-0 z-10 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
      <div className="flex items-end gap-3 px-3 pb-3">
        <div className="min-w-0 flex-1">
          <Button variant="link" className="h-auto p-0 text-base font-bold text-feed-foreground underline-offset-2 hover:text-feed-foreground" onClick={onProfile}>{video.uploader || "creator"}</Button>
          <div className="mt-1.5">
            <Link to="/watch/$videoId" params={{ videoId: video.id }} onClick={() => { try { sessionStorage.setItem(`vhxtube-video-${video.id}`, JSON.stringify(video)); } catch {} }} className="block text-sm font-bold leading-snug text-feed-foreground hover:underline line-clamp-3">{video.title}</Link>
            <p className="mt-0.5 truncate text-xs font-semibold text-feed-foreground/85">{hashtags.join(" ")}</p>
            <p className="mt-1 flex items-center gap-1 text-[0.7rem] text-feed-muted"><Eye className="size-3.5" /> {video.views}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-5">
          <button type="button" onClick={onProfile} aria-label={`View ${video.uploader || "creator"} profile`} title="Creator profile" className="relative shrink-0">
            <img src={video.thumbnail} alt="" className="size-12 rounded-full border-2 border-feed-foreground object-cover" />
            <span aria-hidden="true" className="absolute -bottom-2 left-1/2 grid size-5 -translate-x-1/2 place-items-center rounded-full bg-primary text-primary-foreground"><Plus className="size-3.5" /></span>
          </button>
          <div className="flex flex-col items-center gap-1"><Button variant="ghost" onClick={() => toggleAction("like", liked)} aria-label={liked ? "Unlike video" : "Like video"} title={liked ? "Unlike" : "Like"} aria-pressed={liked} className={railButton}><Heart className={cn(liked && "fill-primary text-primary")} /></Button><span className="text-xs font-semibold text-feed-foreground drop-shadow">{liked ? "Liked" : "Like"}</span></div>
          <div className="flex flex-col items-center gap-1"><Link to="/watch/$videoId" params={{ videoId: video.id }} aria-label="Watch video" title="Watch" onClick={() => { try { sessionStorage.setItem(`vhxtube-video-${video.id}`, JSON.stringify(video)); } catch {} }} className="text-feed-foreground hover:text-feed-foreground/75 [&_svg]:size-8"><MonitorPlay /></Link><span className="text-xs font-semibold text-feed-foreground drop-shadow">Watch</span></div>
          <div className="flex flex-col items-center gap-1"><Button variant="ghost" onClick={() => toggleAction("bookmark", saved)} aria-label={saved ? "Remove bookmark" : "Bookmark video"} title={saved ? "Remove bookmark" : "Bookmark"} aria-pressed={saved} className={railButton}><Bookmark className={cn(saved && "fill-feed-foreground")} /></Button><span className="text-xs font-semibold text-feed-foreground drop-shadow">{saved ? "Saved" : "Save"}</span></div>
          <div className="flex flex-col items-center gap-1"><Button variant="ghost" onClick={share} aria-label="Share video" title="Share" className={railButton}><Forward /></Button><span className="text-xs font-semibold text-feed-foreground drop-shadow">Share</span></div>
          <button type="button" aria-label="Music information" title="Music / original sound" className="shrink-0" onClick={onMusic}>
            <span className="grid size-11 place-items-center rounded-full border-2 border-feed-foreground/30 bg-feed/40">
              <img src={video.thumbnail} alt="" className={cn("size-9 rounded-full object-cover", visible && !paused && "spin-slow")} />
            </span>
          </button>
        </div>
      </div>

      <Link to="/results" search={{ q: searchQueryOf(video.title) }} className="mx-3 mb-2 flex h-11 items-center gap-2 rounded-full bg-feed-caption px-4 text-feed-caption-foreground shadow-sm" aria-label={`Search for ${searchQueryOf(video.title)}`}>
        <Search className="size-5 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">Search · {searchQueryOf(video.title)}</span>
        <ChevronRight className="size-5 shrink-0 opacity-70" aria-hidden="true" />
      </Link>

      <input
        type="range"
        min={0}
        max={100}
        step={0.1}
        value={progress}
        aria-label={`Video progress: ${video.title}`}
        className="feed-progress block w-full"
        style={{ ["--feed-progress" as string]: `${progress}%` } as React.CSSProperties}
        onChange={e => seek(Number(e.target.value))}
      />
    </div>
  </div>;
}

function FeedAd({ ad, onSkip }: { ad: Ad; onSkip: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const [progress, setProgress] = useState(0);
  const done = useRef(false);
  const skipRef = useRef(onSkip);
  skipRef.current = onSkip;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.7 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!seen) { setProgress(0); done.current = false; return; }
    const total = Math.max(1, ad.countdown ?? 5) * 1000;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / total);
      setProgress(p * 100);
      if (p >= 1) { if (!done.current) { done.current = true; skipRef.current(); } return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, ad.countdown]);
  return (
    <div ref={ref} className="relative h-dvh w-screen shrink-0 snap-start snap-always overflow-hidden bg-feed">
      <a href={ad.linkUrl} onClick={() => trackAd(ad.id, "clicks")} target="_blank" rel="noopener sponsored" className="block size-full">
        <AdMedia ad={ad} className="absolute inset-0 size-full bg-feed object-contain" />
      </a>
      <span className="absolute left-4 top-20 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Sponsored</span>
      <div className="absolute inset-x-0 bottom-0 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between gap-3 px-4 pb-4">
          <p className="min-w-0 truncate rounded-full bg-background/80 px-3 py-1.5 text-sm font-semibold">{ad.title}</p>
          <button onClick={onSkip} className="flex shrink-0 items-center gap-1 rounded-full bg-background/85 px-4 py-2 text-sm font-semibold">Skip <ChevronsRight className="size-4" /></button>
        </div>
        <div aria-label="Ad progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} className="h-1 w-full bg-feed-foreground/25">
          <div className="h-full bg-feed-foreground" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
