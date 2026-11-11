import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Expand, Pause, Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { ApiVideo } from "@/lib/api-client";
import { galleryImages } from "@/lib/gallery-media";
import { downloadImage } from "@/lib/download";

async function save(src: string, title: string) {
  const ok = await downloadImage(src, title);
  if (ok) toast.success("Image downloaded");
  else toast("Opened in a new tab — save it from there");
}

export function ImageCollection({ videos }: { videos: ApiVideo[] }) {
  const images = galleryImages(videos);
  const [selected, setSelected] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const step = (direction: number) => setSelected(index => index === null ? null : (index + direction + images.length) % images.length);
  useEffect(() => {
    if (!playing || selected === null || images.length < 2) return;
    const timer = window.setInterval(() => setSelected(index => index === null ? null : (index + 1) % images.length), 3500);
    return () => window.clearInterval(timer);
  }, [playing, selected, images.length]);
  if (!images.length) return <p className="py-10 text-muted-foreground">No images available.</p>;
  const current = selected !== null ? images[selected] : null;
  return <>
    <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
      {images.map((image, index) => <figure key={image.thumbnail} className="group relative break-inside-avoid overflow-hidden rounded-sm bg-surface">
        <button className="block w-full" aria-label={`View image: ${image.title}`} onClick={() => setSelected(index)}>
          <img src={image.thumbnail} alt={image.title} loading="lazy" className="block h-auto w-full object-contain" />
        </button>
        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-background/90 to-transparent p-2 pt-8">
          <span className="truncate text-xs font-medium">{image.uploader || image.title}</span>
          <span className="pointer-events-auto flex gap-1">
            <button aria-label={`Download ${image.title}`} onClick={() => save(image.thumbnail, image.title)} className="grid size-8 place-items-center rounded-full bg-background/80 backdrop-blur hover:text-accent"><Download className="size-4" /></button>
            <button aria-label="Open full screen" onClick={() => setSelected(index)} className="hidden size-8 place-items-center rounded-full bg-background/80 backdrop-blur hover:text-accent sm:grid"><Expand className="size-4" /></button>
          </span>
        </figcaption>
      </figure>)}
    </div>
    <Dialog open={selected !== null} onOpenChange={open => { if (!open) { setSelected(null); setPlaying(false); } }}>
      <DialogContent className="w-[calc(100%-1rem)] max-w-5xl p-4" aria-describedby={undefined} onKeyDown={event => { if (event.key === "ArrowLeft") step(-1); if (event.key === "ArrowRight") step(1); }}>
        <DialogTitle className="truncate pr-8">{current?.title ?? "Images"}</DialogTitle>
        {current && <div className="relative" onTouchStart={event => { event.currentTarget.dataset.touchX = String(event.touches[0]?.clientX); }} onTouchEnd={event => { const start = Number(event.currentTarget.dataset.touchX); const end = event.changedTouches[0]?.clientX; if (end !== undefined && Math.abs(start - end) > 45) step(start > end ? 1 : -1); }}>
          <img src={current.thumbnail} alt={current.title} className="h-[min(65dvh,42rem)] w-full object-contain" />
        </div>}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="secondary" size="icon" aria-label="Previous image" disabled={images.length < 2} onClick={() => step(-1)}><ChevronLeft /></Button>
          <span className="min-w-16 text-center text-sm tabular-nums">{(selected ?? 0) + 1} / {images.length}</span>
          <Button variant="secondary" size="icon" aria-label={playing ? "Pause slideshow" : "Play slideshow"} onClick={() => setPlaying(!playing)}>{playing ? <Pause /> : <Play />}</Button>
          <Button variant="secondary" size="icon" aria-label="Next image" disabled={images.length < 2} onClick={() => step(1)}><ChevronRight /></Button>
          {current && <Button className="rounded-full" onClick={() => save(current.thumbnail, current.title)}><Download /> Download</Button>}
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
