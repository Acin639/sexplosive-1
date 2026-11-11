import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { SiteLayout } from "./SiteLayout";
import { Button } from "@/components/ui/button";
import { PAGE_LABELS, usePageStatus, type PageKey } from "@/lib/page-status";

export function PageClosedGate({ page, children }: { page: PageKey; children: ReactNode }) {
  const { closed } = usePageStatus();
  if (!closed[page]) return <>{children}</>;
  return (
    <SiteLayout>
      <div className="mx-auto max-w-md rounded-3xl surface-card p-8 text-center">
        <Lock className="mx-auto size-10 text-accent" />
        <h1 className="mt-4 font-display text-2xl font-bold">{PAGE_LABELS[page]} is closed</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page is temporarily unavailable. Please check back later.</p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/">Back home</Link>
        </Button>
      </div>
    </SiteLayout>
  );
}
