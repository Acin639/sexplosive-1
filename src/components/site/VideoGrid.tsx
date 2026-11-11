import { Fragment } from "react";
import { AdCard } from "./AdSlot";
import { SharePromoCard } from "./SharePromoCard";
import { adAfter, useSlotAd } from "@/lib/ads";
import { Link } from "@tanstack/react-router";
import {
  formatDuration,
  type ApiVideo,
} from "@/lib/api-client";

export function VideoCard({
  video,
  allVideos = [],
  compact = false,
}: {
  video: ApiVideo;
  allVideos?: ApiVideo[];
  /** Desktop side-list layout: thumbnail left, text right. */
  compact?: boolean;
}) {
  const handleClick = () => {
    try {
      /*
       * Save the exact video object that came from
       * /api/home or /api/search.
       *
       * This means the watch page does NOT need
       * to call /api/video.
       */
      sessionStorage.setItem(
        `vhxtube-video-${video.id}`,
        JSON.stringify(video),
      );

      /*
       * Save the currently displayed videos.
       * These will be used as watch-page suggestions,
       * but never wipe the saved list when the card
       * has no list of its own.
       */
      if (allVideos.length > 0) {
        sessionStorage.setItem(
          "vhxtube-suggestions",
          JSON.stringify(allVideos),
        );
      }
    } catch (error) {
      console.error(
        "Could not save video information:",
        error,
      );
    }
  };

  return (
    <Link
      to="/watch/$videoId"
      params={{
        videoId: video.id,
      }}
      onClick={handleClick}
      className={compact
        ? "group grid grid-cols-[168px_minmax(0,1fr)] gap-3"
        : "group block overflow-hidden rounded-2xl surface-card sheen tilt-hover"}
    >
      <div className={`relative aspect-video overflow-hidden ${compact ? "rounded-md" : ""}`}>
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <span className="absolute bottom-2 right-2 rounded-md bg-background/85 px-1.5 py-0.5 text-[11px] font-medium">
          {formatDuration(video.duration)}
        </span>
      </div>

      <div className={compact ? "min-w-0 py-0.5" : "p-3"}>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {video.title}
        </h3>

        <p className="mt-1 truncate text-xs text-muted-foreground">
          {video.uploader}
        </p>

        <p className="truncate text-xs text-muted-foreground">
          {video.views} · {video.age}
        </p>
      </div>
    </Link>
  );
}

export function VideoGridSkeleton({
  count = 8,
}: {
  count?: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl surface-card"
        >
          <div className="aspect-video bg-secondary/60" />

          <div className="space-y-2 p-3">
            <div className="h-4 w-3/4 rounded bg-secondary/60" />
            <div className="h-3 w-1/2 rounded bg-secondary/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function VideoGrid({
  videos,
  loading,
  error,
  skeletonCount = 8,
}: {
  videos: ApiVideo[];
  loading?: boolean;
  error?: string | null;
  skeletonCount?: number;
}) {
  const gridAd = useSlotAd("video-grid");
  if (error && videos.length === 0) {
    return (
      <p className="text-sm text-destructive">
        {error}
      </p>
    );
  }

  if (!videos.length) {
    return (
      <VideoGridSkeleton
        count={skeletonCount}
      />
    );
  }

  return (
    <div>
      {loading && (
        <p className="mb-3 text-xs text-muted-foreground">
          Updating videos...
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <SharePromoCard />
        {videos.map((video, i) => (
          <Fragment key={video.id}>
            <VideoCard video={video} allVideos={videos} />
            {gridAd && adAfter(i, gridAd.frequency) && (
              <AdCard ad={gridAd} imgClassName="aspect-video h-auto sm:h-auto" />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
