import { AdMedia } from "./AdSlot";
import { trackAd } from "@/lib/ads";
import { useEffect, useState } from "react";
import { img } from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchHome } from "@/lib/api-client";

const SLIDES = [
  { id: "premium", seed: "slide-premium", kicker: "Premium", title: "Enjoy premium content for only $4", cta: "Join", to: "/premium" },
  { id: "extension", seed: "slide-extension", kicker: "Mirth extension", title: "Stay hidden from malware with the Mirth extension", cta: "Get", to: "/extension" },
  { id: "api", seed: "slide-api", kicker: "Developers", title: "Are you a developer? Get the app API for $10", cta: "Get", to: "/api-docs" },
  { id: "ai", seed: "slide-ai", kicker: "AI", title: "Looking for an AI? Meet yours", cta: "Meet", href: "https://example.com" },
] as const;
import { Button } from "@/components/ui/button";
import { adAfter, useSlotAd } from "@/lib/ads";
import { useCountdown } from "./AdSlot";
import { ChevronsRight } from "lucide-react";

type Item = { kind: "slide"; s: (typeof SLIDES)[number] } | { kind: "ad"; key: string };

export function HeroSlider() {
  const [i, setI] = useState(0);
  const ad = useSlotAd("slider");
  const [adHidden, setAdHidden] = useState(false);
  const { data } = useQuery({ queryKey: ["home", 100], queryFn: () => fetchHome(100) });
  const bgs = (data?.videos ?? []).map((v) => v.thumbnail).filter(Boolean) as string[];
  const items: Item[] = [];
  SLIDES.forEach((s, idx) => {
    items.push({ kind: "slide", s });
    if (ad && !adHidden && adAfter(idx, ad.frequency)) items.push({ kind: "ad", key: `ad-${idx}` });
  });
  const n = items.length;
  const current = items[i % n];
  const left = useCountdown(ad?.countdown ?? 5, current?.kind === "ad");

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % n), current?.kind === "ad" ? Math.max(5, (ad?.countdown ?? 5) + 2) * 1000 : 5000);
    return () => clearInterval(t);
  }, [n, current?.kind, ad?.countdown]);

  return (
    <div className="relative overflow-hidden rounded-md surface-card">
      <div
        className="flex w-full transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{ transform: `translateX(-${(i % n) * 100}%)` }}
      >
        {items.map((it) => it.kind === "ad" && ad ? (
          <div key={it.key} className="relative h-[34vh] min-h-[220px] w-full shrink-0 sm:h-[44vh] sm:min-h-[320px] lg:aspect-[21/8] lg:h-auto lg:min-h-0">
            <a href={ad.linkUrl} onClick={() => trackAd(ad.id, "clicks")} target="_blank" rel="noopener sponsored" className="relative block size-full overflow-hidden bg-background">
              <AdMedia ad={ad} className="block size-full object-contain" />
            </a>
            <span className="absolute left-4 top-4 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Ad · {ad.title}</span>
            <div className="absolute right-4 top-4">
              {left > 0 ? (
                <span className="grid size-8 place-items-center rounded-full bg-background/80 text-xs font-bold">{left}</span>
              ) : (
                <button aria-label="Skip ad" onClick={() => { setAdHidden(true); setI(0); }} className="grid size-8 place-items-center rounded-full bg-background/80"><ChevronsRight className="size-5" /></button>
              )}
            </div>
          </div>
        ) : it.kind === "slide" ? ((s, si) => (
          <div key={s.id} className="relative h-[34vh] min-h-[220px] w-full shrink-0 sm:h-[44vh] sm:min-h-[320px] lg:aspect-[21/8] lg:h-auto lg:min-h-0">
            <img src={bgs.length ? bgs[(si * 7) % bgs.length] : img(s.seed, 1600, 700)} alt={s.title} className="size-full object-cover" />
            <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-70" />
            <div className="absolute inset-0 flex flex-col justify-end gap-3 p-6 sm:p-10 lg:p-14">
              <span className="w-fit rounded-full bg-background/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-accent">
                {s.kicker}
              </span>
              <h2 className="max-w-2xl text-2xl font-bold leading-tight sm:text-4xl lg:text-5xl">{s.title}</h2>
              {"to" in s ? (
                <Button asChild size="lg" className="w-fit rounded-full px-8"><Link to={s.to}>{s.cta}</Link></Button>
              ) : (
                <Button asChild size="lg" className="w-fit rounded-full px-8"><a href={s.href} target="_blank" rel="noopener noreferrer">{s.cta}</a></Button>
              )}
            </div>
          </div>
        ))(it.s, SLIDES.indexOf(it.s)) : null)}
      </div>

      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {items.map((s, idx) => (
          <button
            key={idx}
            aria-label={`Slide ${idx + 1}`}
            onClick={() => setI(idx)}
            className={`h-1.5 rounded-full transition-all ${idx === i % n ? "w-6 bg-accent" : "w-2 bg-foreground/40"}`}
          />
        ))}
      </div>
    </div>
  );
}
