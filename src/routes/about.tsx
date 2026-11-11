import { createFileRoute, Link } from "@tanstack/react-router";
import { Cpu, Globe, Radio, ShieldCheck, Sparkles, Code2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { img } from "@/lib/mock-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Sexplosive & its creator" },
      {
        name: "description",
        content:
          "The story behind Sexplosive — a 3D porn platform and only fans gateway",
      },
      { property: "og:title", content: "About Sexplosive & its creator" },
      {
        property: "og:description",
        content: "The story behind Sexplosive and the creator behind the VHX engine.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const PILLARS = [
  { icon: Radio, title: "Live first", text: "Random connect rooms and premium streamer sessions with real camera and mic control." },
  { icon: Sparkles, title: "Premium feed", text: "A gated feed with exclusive drops and a leaks-first category rail." },
  { icon: ShieldCheck, title: "Stealth & safety", text: "Stealth browsing, adults-only access and clear streamer payout rules." },
  { icon: Cpu, title: "VHX engine", text: "The in-house rendering and delivery layer powering every page of this site." },
];

function AboutPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="relative overflow-hidden rounded-3xl surface-card sheen">
          <img
            src={img("about-hero", 1600, 700)}
            alt="Neon abstract backdrop representing the VHX engine"
            className="h-56 w-full object-cover sm:h-72"
          />
          <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-70" />
          <div className="absolute inset-0 flex flex-col justify-end gap-2 p-6 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">About</p>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">
              Sexplosive — streaming, rebuilt in 3D
            </h1>
          </div>
        </header>

        <section className="rounded-2xl surface-card p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold">What this is</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Sexplosive is a porn streaming platform and a gateway to only fans and leaks.Enjoy the art of porn and cum like a king 👑
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {PILLARS.map((p) => (
            <div key={p.title} className="rounded-2xl surface-card p-5 tilt-hover">
              <p.icon className="size-6 text-accent" />
              <h3 className="mt-3 font-display text-base font-bold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl surface-card sheen p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold">The creator</h2>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
            <img
              src={img("vhx-creator", 320, 320)}
              alt="Portrait of the Sexplosive creator"
              className="size-24 shrink-0 rounded-2xl object-cover ring-2 ring-accent/50 sm:size-28"
            />
            <div>
              <p className="font-display text-lg font-bold">samuel G &amp; engineer</p>
             
              
              <p className="text-sm text-accent">Creator of ineer</p>
              <p className="text-sm text-accent">Creator using the VHX engine</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                A fullstack engineer who created the sexolosive empire using 6ixide's VHX building engine to create the legacy.The sexplosive empire started fueled by people's desire for porn and fee only fans(OF)
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Obsessed with porn or developing ?&apos;s
                 UI.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Stat icon={Code2} label="Built solo" value="1 developer" />
            <Stat icon={Globe} label="Powered by" value="VHX engine" />
            <Stat icon={Sparkles} label="Focus" value="3D motion UI" />
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link
              to="/api-docs"
              className="rounded-full border border-border px-5 py-2 transition-colors hover:border-accent hover:text-accent"
            >
              Explore the API
            </Link>
            <Link
              to="/terms"
              className="rounded-full border border-border px-5 py-2 transition-colors hover:border-accent hover:text-accent"
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Code2;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/40 p-4">
      <Icon className="size-5 text-accent" />
      <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-display text-sm font-bold">{value}</p>
    </div>
  );
}
