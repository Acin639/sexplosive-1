import { Activity, Globe, Monitor, MousePointerClick, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
const METRICS = [
  { icon: Activity, label: "Active users" }, { icon: Users, label: "Total visitors" },
  { icon: Globe, label: "Countries" }, { icon: MousePointerClick, label: "Pages clicked" },
  { icon: Monitor, label: "Devices" },
];
export function TrafficAnalytics() {
  return <section className="border-y border-border py-6">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-display text-lg font-bold">Visitor analytics</h2>
      <Button asChild variant="secondary"><a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer"><ExternalLink /> Google Analytics</a></Button>
    </header>
    <p className="mt-2 text-sm text-muted-foreground">Tracking connected · Reporting access not connected</p>
    <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-5">
      {METRICS.map(({ icon: Icon, label }) => <div key={label} className="min-w-0 rounded-md border border-border p-4"><Icon className="size-5 text-accent" /><h3 className="mt-2 text-sm font-medium">{label}</h3><p className="mt-2 text-xl text-muted-foreground">—</p><p className="mt-1 text-xs text-muted-foreground">Report unavailable</p></div>)}
    </div>
  </section>;
}