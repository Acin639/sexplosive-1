import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import {
  Activity,
  Cpu,
  Crown,
  DollarSign,
  Download,
  KeyRound,
  Mail,
  Radio,
  Users,
} from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminGate } from "@/components/site/AdminGate";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { img } from "@/lib/mock-data";
import { useAdminStats } from "@/lib/admin-stats";
import { TrafficAnalytics } from "@/components/site/TrafficAnalytics";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { setConsentEnabled, useConsentEnabled } from "@/lib/consent";
import { PAGE_KEYS, PAGE_LABELS, setPageClosed, usePageStatus } from "@/lib/page-status";


export const Route = createFileRoute("/chebwai/")({
  head: () => ({
    meta: [
      { title: "Chebwai console — Sexplosive" },
      {
        name: "description",
        content: "Private Sexplosive console: live users, streamer commission, engine status and revenue.",
      },
      { property: "og:title", content: "Chebwai console — Sexplosive" },
      { property: "og:description", content: "Live users, revenue and engine status for Sexplosive." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AdminGate title="Chebwai console">
      <AdminDashboard />
    </AdminGate>
  ),
});


function AdminDashboard() {
  const [showUsers, setShowUsers] = useState(false);
  const s = useAdminStats();

  const money = (n: number) => `$${Math.round(n).toLocaleString()}`;
  const total = s.total;
  const REVENUE = s.revenue;
  const SOURCES = s.sources;

  return (
    <SiteLayout>
      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl glow-text">Admin console</h1>
            <p className="mt-1 text-sm text-muted-foreground">Live platform metrics from the database.</p>
          </div>
          <Button asChild variant="secondary" className="rounded-full">
            <Link to="/chebwai/workspace">
              <Mail className="mr-2 size-4" /> Open workspace
            </Link>
          </Button>
        </header>

        {s.error && (
          <p className="rounded-2xl bg-destructive/10 p-3 text-xs text-destructive">
            Database unreachable: {s.error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={Users} label="Logged-in users" value={`${s.loggedIn}`} sub={`${s.users.length} accounts total`} />
          <Stat icon={Activity} label="Active on site" value={`${s.activeNow}`} sub="last 5 minutes" />
          <Stat icon={Radio} label="Streamers" value={`${s.streamerCount}`} sub={`commission ${money(s.commission)}`} />
          <Stat icon={Cpu} label="VHX engine" value={s.error ? "Degraded" : "Operational"} sub="realtime sync" />
          <Stat icon={Download} label="Extension downloads" value={`${s.extensionDownloads}`} sub={`${money(s.extensionRevenue)} earned`} />
          <Stat icon={KeyRound} label="API accounts" value={`${s.apiAccounts}`} sub={`${money(s.apiRevenue)} earned`} />
          <Stat icon={DollarSign} label="Total revenue" value={money(total)} sub={`${s.payments.length} payments`} />
          <Stat icon={Crown} label="Premium members" value={`${s.premiumMembers}`} sub="active subscriptions" />
        </div>

        <section className="rounded-3xl surface-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold">Users</h2>
            <Button variant="secondary" className="rounded-full" onClick={() => setShowUsers((v) => !v)}>
              {showUsers ? "Hide" : "View users"}
            </Button>
          </div>
          {showUsers && (
            <div className="mt-4 divide-y divide-border/60">
              {s.users.length === 0 && (
                <p className="py-3 text-sm text-muted-foreground">No users in the database yet.</p>
              )}
              {s.users.map((u) => (
                <div key={u.uid} className="flex items-center gap-3 py-3">
                  <img src={img(u.uid, 80, 80)} alt="" className="size-10 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{u.username ?? "member"}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-accent">
                    {u.premium ? "Premium" : u.apiAccount ? "API" : "Free"}
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    {u.online ? "online" : "offline"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>


        <TrafficAnalytics />
        <PageControls />

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl surface-card p-5 lg:col-span-2">
            <h2 className="font-display text-lg font-bold">Income by source</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="Streams" stackId="1" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.35} />
                  <Area type="monotone" dataKey="Premium" stackId="1" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.35} />
                  <Area type="monotone" dataKey="Extension" stackId="1" stroke="var(--gold)" fill="var(--gold)" fillOpacity={0.35} />
                  <Area type="monotone" dataKey="API" stackId="1" stroke="var(--destructive)" fill="var(--destructive)" fillOpacity={0.35} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl surface-card p-5">
            <h2 className="font-display text-lg font-bold">Revenue split</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={SOURCES} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {SOURCES.map((src) => (
                      <Cell key={src.name} fill={src.color} />
                    ))}

                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="rounded-3xl surface-card p-5">
          <h2 className="font-display text-lg font-bold">Monthly totals</h2>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE.map((r) => ({ month: r.month, Total: r.Streams + r.Premium + r.Extension + r.API }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="Total" fill="var(--accent)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
  sub,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl surface-card p-4 tilt-hover">
      <Icon className="size-5 text-accent" />
      <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-display text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function PageControls() {
  const { closed, error } = usePageStatus();
  const consent = useConsentEnabled();
  const toggle = async (key: (typeof PAGE_KEYS)[number], value: boolean) => {
    try {
      await setPageClosed(key, value);
      toast.success(`${PAGE_LABELS[key]} ${value ? "closed" : "reopened"}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    }
  };
  return (
    <section className="rounded-3xl surface-card p-5">
      <h2 className="font-display text-lg font-bold">Page access</h2>
      <p className="mt-1 text-xs text-muted-foreground">Close a page to hide it from visitors. Saved instantly.</p>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PAGE_KEYS.map((k) => (
          <label key={k} className="flex items-center justify-between gap-3 rounded-2xl bg-secondary px-4 py-3">
            <span className="text-sm font-medium">
              {PAGE_LABELS[k]}
              <span className={`ml-2 text-[11px] ${closed[k] ? "text-destructive" : "text-accent"}`}>
                {closed[k] ? "Closed" : "Open"}
              </span>
            </span>
            <Switch checked={closed[k]} onCheckedChange={(v) => toggle(k, v)} aria-label={`Close ${PAGE_LABELS[k]}`} />
          </label>
        ))}
        <label className="flex items-center justify-between gap-3 rounded-2xl bg-secondary px-4 py-3">
          <span className="text-sm font-medium">
            Age popup on home
            <span className={`ml-2 text-[11px] ${consent ? "text-accent" : "text-destructive"}`}>{consent ? "Shown" : "Never shown"}</span>
          </span>
          <Switch
            checked={consent !== false}
            onCheckedChange={(v) => setConsentEnabled(v).then(() => toast.success(v ? "Age popup on" : "Age popup turned off")).catch(() => toast.error("Could not save"))}
            aria-label="Show age popup"
          />
        </label>
      </div>
    </section>
  );
}
