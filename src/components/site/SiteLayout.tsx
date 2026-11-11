import type { ReactNode } from "react";
import { EyeOff } from "lucide-react";
import { TopNav } from "./TopNav";
import { SiteFooter } from "./SiteFooter";
import { useStealth } from "@/lib/stealth";

export function SiteLayout({ children }: { children: ReactNode }) {
  const stealth = useStealth();

  return (
    <div id="site-shell" className="flex min-h-screen flex-col">
      {stealth && (
        <div className="flex items-center justify-center gap-2 bg-secondary px-4 py-2 text-xs font-medium text-muted-foreground">
          <EyeOff className="size-4 text-accent" />
          Incognito — this session isn&apos;t saved to your history
        </div>
      )}
      <TopNav />
      <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 2xl:max-w-[1600px] px-[clamp(0.75rem,3vw,2rem)] py-[clamp(1rem,2.5vw,1.75rem)]">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
