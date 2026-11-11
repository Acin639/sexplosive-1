import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, RefreshCw, Megaphone } from "lucide-react";

export const Route = createFileRoute("/advertise/")({
  head: () => ({
    meta: [
      { title: "Advertise on Sexplosive" },
      { name: "description", content: "Daily traffic, ad formats and how to reach the Sexplosive ad team." },
      { property: "og:title", content: "Advertise on Sexplosive" },
      { property: "og:description", content: "Daily traffic, ad formats and contact options for advertisers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdvertisePage,
});

const STATS = [
  { value: "120K+", label: "Daily visits" },
  { value: "45K+", label: "Unique daily users" },
  { value: "9 min", label: "Avg. time on site" },
];

const METHODS = [
  { title: "Banner ads", text: "Top, sidebar and in-feed banners across every page." },
  { title: "Video pre-roll", text: "Short clips played before videos start." },
  { title: "Sponsored posts", text: "Your content pinned in the feed and shorts row." },
];

const CONTACTS = [
  { label: "Email", value: "ads@sexplosive.com", href: "mailto:ads@sexplosive.com" },
  { label: "WhatsApp", value: "+254 700 000 000", href: "https://wa.me/254700000000" },
  { label: "Phone", value: "+254 700 000 000", href: "tel:+254700000000" },
];

function AdvertisePage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl">
        <header className="border-b border-border pb-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Media kit · 2026</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-none sm:text-6xl">
            Put your brand<br />in front of the crowd.
          </h1>
        </header>

        <section className="grid border-b border-border sm:grid-cols-3">
          {STATS.map((s, i) => (
            <div key={s.label} className={"py-6 sm:px-6 " + (i > 0 ? "border-t border-border sm:border-l sm:border-t-0" : "sm:pl-0")}>
              <p className="font-display text-5xl font-bold tabular-nums text-primary">{s.value}</p>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </section>

        <section className="border-b border-border py-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Formats</h2>
          <ol className="mt-4">
            {METHODS.map((m, i) => (
              <li key={m.title} className="flex gap-5 border-t border-border/60 py-4 first:border-t-0">
                <span className="font-mono text-sm text-accent">0{i + 1}</span>
                <div>
                  <p className="font-display text-xl font-semibold">{m.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{m.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-b border-border py-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Start or renew a campaign</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="h-14 gap-3 rounded-lg px-6"><Link to="/advertise/subscribe"><Megaphone /> Subscribe <ArrowUpRight /></Link></Button>
            <Button asChild variant="outline" className="h-14 gap-3 rounded-lg px-6"><Link to="/advertise/renew"><RefreshCw /> Renew <ArrowUpRight /></Link></Button>
          </div>
        </section>

        <section className="py-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Talk to the ad desk</h2>
          <div className="mt-4">
            {CONTACTS.map((c) => (
              <a key={c.label} href={c.href} target="_blank" rel="noreferrer"
                className="group flex items-baseline justify-between gap-4 border-t border-border/60 py-4 first:border-t-0">
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{c.label}</span>
                <span className="font-display text-lg font-semibold transition-colors group-hover:text-accent sm:text-2xl">{c.value} →</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
