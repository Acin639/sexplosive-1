import { createFileRoute, Link } from "@tanstack/react-router";
import { Spinner } from "@/components/site/Spinner";
import { Button } from "@/components/ui/button";
import { watchCreator, WATCH_FOLLOWERS, WATCH_INSTAGRAM } from "@/lib/watch-creator";
import { Fragment, useEffect, useState } from "react";
import { AdCard, PrerollAd } from "@/components/site/AdSlot";
import { adAfter, useSlotAd } from "@/lib/ads";
import { ThumbsUp, Share2, Download, Lock } from "lucide-react";
import { usePremiumSuggestions } from "@/lib/custom-content";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { siteUrl, copyOrShare } from "@/lib/share";
import { downloadVideo } from "@/lib/download";
import { SiteLayout } from "@/components/site/SiteLayout";
import { VideoCard } from "@/components/site/VideoGrid";
import { img } from "@/lib/mock-data";
import { recordWatch } from "@/lib/history";
import { fetchHome, fetchSearch, type ApiVideo } from "@/lib/api-client";

export const Route = createFileRoute("/watch/$videoId")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Watch — Sexplosive" },
      {
        name: "description",
        content: "Stream this video on Sexplosive with related suggestions.",
      },
      { property: "og:title", content: "Watch — Sexplosive" },
      {
        property: "og:description",
        content: "Stream this video on Sexplosive.",
      },
    ],
  }),

  component: Watch,
});

function suggestQuery(title: string) {
  return title.split(/\s+/).slice(0, 5).join(" ");
}

function Watch() {
  const { videoId } = Route.useParams();

  const [video, setVideo] = useState<ApiVideo | null>(null);
  const [suggestions, setSuggestions] = useState<ApiVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [buffering, setBuffering] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const suggestAd = useSlotAd("suggestions");
  const prerollAd = useSlotAd("preroll");
  const premium = usePremiumSuggestions();
  const premiumItems = premium.enabled ? premium.items.filter((p) => p.title && p.thumbnail) : [];
  const isMobile = useIsMobile();
  const sideCount = isMobile ? suggestions.length : 8;
  const sideList = suggestions.slice(0, sideCount);
  const belowList = suggestions.slice(sideCount);
  const [prerollDone, setPrerollDone] = useState<string | null>(null);
  const [watchCount, setWatchCount] = useState(0);
  useEffect(() => {
    const n = Number(sessionStorage.getItem("vhx-watch-count") ?? "0") + 1;
    sessionStorage.setItem("vhx-watch-count", String(n));
    setWatchCount(n);
  }, [videoId]);
  const showPreroll =
    !!prerollAd && watchCount > 0 && prerollDone !== video?.id && watchCount % Math.max(1, prerollAd.frequency ?? 1) === 0;

  useEffect(() => {
    try {
      /*
       * The video was already fetched from:
       *
       * /api/home
       * or
       * /api/search
       *
       * We retrieve that existing JSON instead of
       * requesting /api/video again.
       */

      const storedVideo = sessionStorage.getItem(
        `vhxtube-video-${videoId}`
      );

      if (!storedVideo) {
        setError(
          "Video information was not found. Please go back and select the video again."
        );
        setLoading(false);
        return;
      }

      const parsedVideo = JSON.parse(storedVideo) as ApiVideo;

      if (!parsedVideo.default_quality_url) {
        setError("This video does not have a playable video URL.");
        setLoading(false);
        return;
      }

      setVideo(parsedVideo);

      /*
       * Suggestions come from the grid the visitor arrived from,
       * and fall back to a live title search when none were saved.
       */
      const storedSuggestions =
        sessionStorage.getItem("vhxtube-suggestions");
      let found: ApiVideo[] = [];

      if (storedSuggestions) {
        try {
          found = (JSON.parse(storedSuggestions) as ApiVideo[])
            .filter((item) => item.id !== parsedVideo.id)
            .slice(0, 12);
        } catch {
          found = [];
        }
      }

      setSuggestions(found);
      setLoading(false);

      if (found.length === 0) {
        const loadFallback = async () => {
          try {
            const data = await fetchSearch(
              suggestQuery(parsedVideo.title),
              { pages: 1, limit: 12 },
            );
            return data.videos;
          } catch {
            try {
              const home = await fetchHome(30);
              return home.videos;
            } catch {
              return [];
            }
          }
        };

        void loadFallback().then((videos) => {
          setSuggestions(
            videos
              .filter((item) => item.id !== parsedVideo.id)
              .slice(0, 12),
          );
        });
      }
    } catch (err) {
      console.error("Watch page error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load video."
      );

      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    if (!video) return;

    void recordWatch({
      videoId: video.id,
      title: video.title,
      seed: video.id,
      uploader: video.uploader,
    });
  }, [video]);

  const share = async () => {
    try {
      const r = await copyOrShare(video?.title ?? "Sexplosive", siteUrl(`/watch/${encodeURIComponent(videoId)}`));
      if (r === "copied") toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy the link");
    }
  };

  const download = async () => {
    if (!video?.default_quality_url) return;
    toast.message("Preparing download…");
    const ok = await downloadVideo(video.default_quality_url, video.title);
    if (ok) toast.success("Download started");
    else toast.message("Opened the video — use your browser's save option");
  };

  if (loading) {
    return (
      <SiteLayout>
        <div className="grid aspect-video place-items-center rounded-lg surface-card"><Spinner label="Loading video" /></div>
      </SiteLayout>
    );
  }

  if (error || !video) {
    return (
      <SiteLayout>
        <div className="space-y-4">
          <p className="text-sm text-destructive">
            {error || "Video not found"}
          </p>

          <Link
            to="/"
            className="inline-block rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
          >
            Back to homepage
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">

        {/* ============================= */}
        {/* VIDEO */}
        {/* ============================= */}

        <div className="min-w-0">

          <div className="relative -mx-4 aspect-video overflow-hidden bg-black sm:mx-0 sm:rounded-lg">

            <video
              key={video.default_quality_url}
              className="size-full bg-black"
               controls={!buffering && !showPreroll}
              playsInline
              preload="metadata"
              poster={video.thumbnail}
              src={video.default_quality_url}
              onPlay={(e) => {
                if (showPreroll) e.currentTarget.pause();
              }}
              onLoadStart={() => setBuffering(true)}
              onWaiting={() => setBuffering(true)}
               onSeeking={() => setBuffering(true)}
               onSeeked={(e) => { if (e.currentTarget.readyState >= 3) setBuffering(false); }}
               onError={() => setBuffering(false)}
              onCanPlay={() => setBuffering(false)}
              onLoadedData={() => setBuffering(false)}
              onPlaying={() => setBuffering(false)}
            />
            {buffering && !showPreroll && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <Spinner label="Buffering video" />
              </div>
            )}
            {showPreroll && prerollAd && (
              <PrerollAd ad={prerollAd} onDone={() => setPrerollDone(video.id)} />
            )}

          </div>


          {/* TITLE */}

          <h1 className="mt-4 font-display text-xl font-bold sm:text-2xl">
            {video.title}
          </h1>


          {/* VIDEO INFORMATION */}

          <p className="mt-1 text-sm text-muted-foreground">
            {video.views ?? "Unknown views"}
            {" · "}
            {video.age ?? ""}
          </p>


          {/* UPLOADER */}

          <div className="mt-4 flex flex-wrap items-center gap-3">

            <div className="flex min-w-0 items-center gap-3">

              <img
                src={img(
                  watchCreator(video.uploader),
                  80,
                  80
                )}
                alt={watchCreator(video.uploader)}
                className="size-10 shrink-0 rounded-full object-cover"
              />

              <div className="min-w-0">

                <Link
                  to="/creator/$name"
                  params={{ name: watchCreator(video.uploader) }}
                  className="block truncate text-sm font-semibold hover:underline"
                >
                  {watchCreator(video.uploader)}
                </Link>

                <p className="text-xs text-muted-foreground">
                  {WATCH_FOLLOWERS} followers
                </p>

              </div>

            </div>


            <Button asChild className="ml-auto rounded-full"><a href={WATCH_INSTAGRAM} target="_blank" rel="noopener noreferrer">Follow</a></Button>

          </div>


          {/* ACTION BUTTONS */}

          <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-none">

            <button
              className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-2 text-sm"
            >
              <ThumbsUp className="size-4" />
              12K
            </button>


            <button
              onClick={share}
              className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-2 text-sm"
            >
              <Share2 className="size-4" />
              Share
            </button>


            <button
              onClick={download}
              className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-2 text-sm"
            >
              <Download className="size-4" />
              Download
            </button>

          </div>


          {/* HASHTAGS */}

          <div className="mt-5 flex flex-wrap gap-2">
            {(video.hashtags?.length
              ? video.hashtags
              : [
                  ...video.title
                    .split(/\s+/)
                    .slice(0, 3)
                    .map((word) => word.replace(/[^a-z0-9]/gi, "").toLowerCase())
                    .filter(Boolean),
                  "vhxtube",
                ]
            ).map((tag) => {
              const clean = tag.replace(/^#/, "");

              return (
                <Link
                  key={tag}
                  to="/results"
                  search={{ q: clean }}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  #{clean}
                </Link>
              );
            })}
          </div>

          {belowList.length > 0 && (
            <section className="mt-8 hidden lg:block">
              <h2 className="mb-4 font-display text-base font-bold">More videos</h2>
              <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">
                {belowList.map((v) => <VideoCard key={v.id} video={v} allVideos={suggestions} />)}
              </div>
            </section>
          )}

        </div>


        {/* ============================= */}
        {/* SUGGESTIONS */}
        {/* ============================= */}

        <aside className="min-w-0 space-y-3">

          <h2 className="font-display text-base font-bold">
            Suggestions
          </h2>

          {premiumItems.map((p, i) => (
            <Link key={i} to="/premium" className="group grid grid-cols-1 gap-3 border border-gold/40 bg-gold/10 p-2 lg:grid-cols-[168px_minmax(0,1fr)]">
              <div className="relative aspect-video overflow-hidden rounded-md">
                <img src={p.thumbnail} alt={p.title} loading="lazy" className="size-full object-cover blur-[2px] brightness-75" />
                <span className="absolute inset-0 grid place-items-center"><Lock className="size-7 text-gold drop-shadow" /></span>
              </div>
              <div className="min-w-0 py-0.5">
                <p className="line-clamp-2 text-sm font-semibold leading-snug">{p.title}</p>
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-gold"><Lock className="size-3" /> Premium</p>
              </div>
            </Link>
          ))}

          {sideList.length > 0 ? (
            sideList.map((v, i) => (
              <Fragment key={v.id}>
                <VideoCard video={v} allVideos={suggestions} compact={!isMobile} />
                {suggestAd && adAfter(i, suggestAd.frequency) && (
                  <AdCard ad={suggestAd} imgClassName="aspect-video h-auto sm:h-auto" />
                )}
              </Fragment>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No suggestions available.
            </p>
          )}

        </aside>

      </div>
    </SiteLayout>
  );
}
