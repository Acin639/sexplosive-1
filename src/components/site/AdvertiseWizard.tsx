import type { ReactNode } from "react";
import { Megaphone, RefreshCw } from "lucide-react";
import { SiteLayout } from "./SiteLayout";

export function AdvertiseWizard({ mode, children }: { mode: "subscribe" | "renew"; children: ReactNode }) {
  const Icon = mode === "subscribe" ? Megaphone : RefreshCw;
  return <SiteLayout>
    <section className="mx-auto min-h-[75dvh] w-full max-w-3xl">
      <header className="mb-8 flex items-center gap-4 border-b border-border pb-6">
        <Icon className="size-8 shrink-0 text-accent" />
        <div><p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Sexplosive advertising</p>
          <h1 className="mt-1 font-display text-3xl font-bold">{mode === "subscribe" ? "Start a campaign" : "Renew your campaign"}</h1>
        </div>
      </header>
      {children}
    </section>
  </SiteLayout>;
}