import { trackAd } from "@/lib/ads";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useSlotAd, type Ad, type AdSlotId } from "@/lib/ads";
import { cn } from "@/lib/utils";

/** Seconds-left counter; returns 0 when the viewer may close. */
export function useCountdown(seconds: number, run = true) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    setLeft(seconds);
    if (!run) return;
    const t = setInterval(() => setLeft((l) => (l > 0 ? l - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [seconds, run]);
  return left;
}

/** Visual ad card with a countdown and a close button once it reaches zero. */
export function AdCard({ ad, className, imgClassName, onClose }: { ad: Ad; className?: string; imgClassName?: string; onClose?: () => void }) {
  const [closed, setClosed] = useState(false);
  const left = useCountdown(ad.countdown ?? 5);
  if (closed) return null;
  return (
    <div className={cn("group relative min-w-0 overflow-hidden rounded-md surface-card", className)}>
      <a href={ad.linkUrl} onClick={() => trackAd(ad.id, "clicks")} target="_blank" rel="noopener sponsored" className="block size-full">
        <AdMedia ad={ad} className={cn("block aspect-video w-full bg-feed object-contain", imgClassName)} />
      </a>
      <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Ad
      </span>
      <span className="absolute bottom-3 left-3 max-w-[70%] truncate rounded-full bg-background/80 px-3 py-1 text-xs font-medium">
        {ad.title}
      </span>
      <div className="absolute right-3 top-3">
        {left > 0 ? (
          <span className="grid size-8 place-items-center rounded-full bg-background/80 text-xs font-bold">{left}</span>
        ) : (
          <button
            aria-label="Close ad"
            onClick={() => (onClose ? onClose() : setClosed(true))}
            className="grid size-8 place-items-center rounded-full bg-background/80 hover:text-accent"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/** Renders the newest active ad for a placement. Hidden when no ad is set. */
export function AdSlot({ slot, className, imgClassName }: { slot: AdSlotId; className?: string; imgClassName?: string }) {
  const ad = useSlotAd(slot);
  if (!ad) return null;
  return <AdCard ad={ad} className={className} imgClassName={imgClassName} />;
}

/** Full-cover pre-roll ad shown before a video plays; "Skip" appears after the countdown. */
export function PrerollAd({ ad, onDone }: { ad: Ad; onDone: () => void }) {
  const left = useCountdown(ad.countdown ?? 5);
  return (
    <div className="absolute inset-0 z-10 bg-background">
      <a href={ad.linkUrl} onClick={() => trackAd(ad.id, "clicks")} target="_blank" rel="noopener sponsored" className="block size-full">
        <AdMedia ad={ad} className="block size-full object-contain" />
      </a>
      <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Ad · {ad.title}
      </span>
      <button
        disabled={left > 0}
        onClick={onDone}
        className="absolute bottom-4 right-4 rounded-full bg-background/85 px-4 py-2 text-sm font-semibold disabled:opacity-80"
      >
        {left > 0 ? `Skip in ${left}` : "Skip ad ›"}
      </button>
    </div>
  );
}

/** Image or muted autoplaying video for an ad. */
export function AdMedia({ ad, className }: { ad: Ad; className?: string }) {
  if (ad.mediaType === "video" && ad.videoUrl) {
    return <video src={ad.videoUrl} poster={ad.imageUrl || undefined} autoPlay muted loop playsInline aria-label={ad.title} className={className} />;
  }
  return <img src={ad.imageUrl} alt={ad.title} loading="lazy" className={className} />;
}
