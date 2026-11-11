import { PageClosedGate } from "@/components/site/PageClosedGate";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/site/Spinner";
import { CalendarDays, CameraOff, Dices, Search, Users, Video } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useCamera } from "@/hooks/use-camera";
import { img } from "@/lib/mock-data";
import { useStreamers, type UiStreamer } from "@/lib/streamers";
import { cn } from "@/lib/utils";

const GENDERS = ["Boy", "Girl", "Both", "Bi", "Gay", "Lesbian", "Trans", "Couple"];

export const Route = createFileRoute("/connect")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Connect — Sexplosive Live Matching" },
      {
        name: "description",
        content: "Pick your preference, get matched live, or book a stream with a streamer.",
      },
      { property: "og:title", content: "Connect — Sexplosive Live Matching" },
      { property: "og:description", content: "Get matched into a live Sexplosive room instantly." },
    ],
  }),
  component: () => (<PageClosedGate page="connect"><Connect /></PageClosedGate>),
});

function Connect() {
  const navigate = useNavigate();
  const { streamers: STREAMERS } = useStreamers();
  const [gender, setGender] = useState(GENDERS[2]);
  const [agreed, setAgreed] = useState(false);
  const [searching, setSearching] = useState(false);
  const [match, setMatch] = useState<UiStreamer | null>(null);
  const [query, setQuery] = useState("");
  const { videoRef, error: camError, ready: camReady } = useCamera(searching || !!match, "user", true);

  // Booking
  const [bookMode, setBookMode] = useState<"random" | "specific">("random");
  const [bookQuery, setBookQuery] = useState("");
  const [bookStreamer, setBookStreamer] = useState<UiStreamer | null>(null);
  const [bookDate, setBookDate] = useState("");

  useEffect(() => {
    if (!searching) return;
    const t = setTimeout(() => {
      const pool = STREAMERS.filter(
        (s) => s.active && (gender === "Both" || s.gender === gender || s.gender === "Both"),
      );
      const found = pool[Math.floor(Math.random() * pool.length)] ?? STREAMERS[0];
      setSearching(false);
      setMatch(found);
      toast.success(`Match found — ${found.name}`);
    }, 9000);
    return () => clearTimeout(t);
  }, [searching, gender, STREAMERS]);

  const list = STREAMERS.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));
  const bookList = STREAMERS.filter((s) =>
    s.name.toLowerCase().includes(bookQuery.toLowerCase()),
  );

  const book = () => {
    if (!bookDate) {
      toast.error("Pick a date for your stream");
      return;
    }
    const target =
      bookMode === "random"
        ? STREAMERS[Math.floor(Math.random() * STREAMERS.length)]
        : bookStreamer;
    if (!target) {
      toast.error("Choose a streamer to book");
      return;
    }
    toast.success(`Booking ${target.name} for ${new Date(bookDate).toLocaleDateString()}`);
    navigate({ to: "/pay/$streamerId", params: { streamerId: target.id }, search: { type: "Personal" } });
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="font-display text-2xl font-bold sm:text-3xl glow-text">Connect</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose how you want to meet, then we find you a live match.
          </p>
        </header>

        <Group label="Gender" options={GENDERS} value={gender} onChange={setGender} />

        <section className="rounded-3xl surface-card p-5">
          <h2 className="mb-1 font-display text-base font-bold">Book a stream</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Schedule a stream with a random person or a specific streamer.
          </p>

          <div className="mb-4 flex gap-2">
            {(["random", "specific"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setBookMode(m)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  bookMode === m
                    ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "border-border bg-secondary/60 hover:border-accent",
                )}
              >
                {m === "random" ? <Dices className="size-4" /> : <Search className="size-4" />}
                {m === "random" ? "Random person" : "Specific user"}
              </button>
            ))}
          </div>

          {bookMode === "specific" && (
            <div className="mb-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={bookQuery}
                  onChange={(e) => setBookQuery(e.target.value)}
                  placeholder="Search a user by name"
                  className="rounded-full pl-9"
                />
              </div>
              <div className="grid max-h-56 gap-2 overflow-y-auto">
                {bookList.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setBookStreamer(s)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border p-2 text-left transition-colors",
                      bookStreamer?.id === s.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/50 hover:border-accent",
                    )}
                  >
                    <img
                      src={s.avatarUrl || img(s.seed, 80, 80)}
                      alt={s.name}
                      className="size-10 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{s.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.gender} · ${s.price}/stream
                      </p>
                    </div>
                  </button>
                ))}
                {!bookList.length && (
                  <p className="p-2 text-xs text-muted-foreground">No user matches that name.</p>
                )}
              </div>
            </div>
          )}

          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Choose a date
          </label>
          <Input
            type="date"
            value={bookDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setBookDate(e.target.value)}
            className="rounded-full"
          />

          <Button className="mt-4 w-full rounded-full" onClick={book}>
            <CalendarDays className="mr-2 size-4" /> Book stream
          </Button>
        </section>

        <section className="rounded-3xl surface-card p-5 text-sm text-muted-foreground">
          <h2 className="mb-2 font-display text-base font-bold text-foreground">
            Terms and conditions
          </h2>
          <p>
            You must be 18+ to connect. Recording, harassment and sharing of other users' streams is
            prohibited. Payments for premium streams are non-refundable once the stream begins.
            Streamers receive 60% of every stream payment. By continuing you accept these terms.
          </p>
          <label className="mt-4 flex items-center gap-3 text-foreground">
            <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(Boolean(v))} />
            <span className="text-sm">I have read and accept the terms</span>
          </label>
        </section>

        <Button
          size="lg"
          className="w-full rounded-full"
          disabled={!agreed || searching || !!match}
          onClick={() => setSearching(true)}
        >
          {searching ? (
            <>
              <Spinner size="sm" className="mr-2" /> Looking for a match…
            </>
          ) : (
            <>
              <Users className="mr-2 size-4" /> Connect
            </>
          )}
        </Button>

        {(searching || match) && (
          <section className="rounded-3xl surface-card p-5 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="mb-3 font-display text-base font-bold">
              {match ? "Match found" : "Your camera"}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-secondary/60">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="size-full scale-x-[-1] object-cover"
                />
                {!camReady && (
                  <div className="absolute inset-0 grid place-items-center gap-2 p-4 text-center text-xs text-muted-foreground">
                    {camError ? (
                      <span className="flex flex-col items-center gap-2">
                        <CameraOff className="size-6" />
                        Camera blocked — allow access to go live
                      </span>
                    ) : (
                      <span className="flex flex-col items-center gap-2">
                        <Video className="size-6 animate-pulse" />
                        Starting camera…
                      </span>
                    )}
                  </div>
                )}
                <span className="absolute bottom-2 left-2 rounded-full bg-background/70 px-2 py-0.5 text-[11px] font-medium">
                  You
                </span>
              </div>

              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-secondary/60">
                {match ? (
                  <>
                    <img
                      src={match.avatarUrl || img(match.seed, 480, 640)}
                      alt={match.name}
                      className="size-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/80 to-transparent p-3">
                      <p className="text-sm font-semibold">{match.name}</p>
                      <p className="text-xs text-muted-foreground">{match.gender}</p>
                    </div>
                  </>
                ) : (
                  <div className="grid size-full place-items-center gap-2 text-xs text-muted-foreground">
                    <Spinner size="sm" label="Waiting for a match" />
                  </div>
                )}
              </div>
            </div>

            {match && (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button
                  size="lg"
                  className="flex-1 rounded-full"
                  onClick={() => navigate({ to: "/live" })}
                >
                  Join live room
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="flex-1 rounded-full"
                  onClick={() => {
                    setMatch(null);
                    setSearching(true);
                  }}
                >
                  Find another
                </Button>
              </div>
            )}
          </section>
        )}

        {(searching || match) && (
          <section className="rounded-3xl surface-card p-5 animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-base font-bold">Premium streamers</h2>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a streamer"
                className="rounded-full pl-9"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {list.map((s) => (
                <button
                  key={s.id}
                  onClick={() =>
                    s.active
                      ? navigate({
                          to: "/pay/$streamerId",
                          params: { streamerId: s.id },
                          search: { type: "Personal" },
                        })
                      : toast.error(`${s.name} is currently inactive`)
                  }
                  className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/50 p-3 text-left tilt-hover"
                >
                  <img
                    src={s.avatarUrl || img(s.seed, 120, 120)}
                    alt={s.name}
                    className="size-14 shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{s.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {s.gender} · ${s.price}/stream
                    </p>
                    <span
                      className={cn(
                        "mt-1 inline-flex items-center gap-1 text-[11px] font-medium",
                        s.active ? "text-accent" : "text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          s.active ? "bg-accent animate-pulse" : "bg-muted-foreground",
                        )}
                      />
                      {s.active ? "Active now" : "Inactive"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </SiteLayout>
  );
}

function Group({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <section className="rounded-3xl surface-card p-5">
      <h2 className="mb-3 font-display text-base font-bold">{label}</h2>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-all",
              value === o
                ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                : "border-border bg-secondary/60 hover:border-accent",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </section>
  );
}
