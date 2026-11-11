import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Crown, LogOut, Puzzle, Radio } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { img } from "@/lib/mock-data";
import { videoFromId } from "@/lib/mock-videos";
import { VideoGrid } from "@/components/site/VideoGrid";
import { logOut, useAccount } from "@/lib/account";
import { useHistory } from "@/lib/history";


export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Your profile — Sexplosive" },
      { name: "description", content: "Your Sexplosive profile, history and membership." },
      { property: "og:title", content: "Your profile — Sexplosive" },
      { property: "og:description", content: "Your Sexplosive profile, history and membership." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const { user, profile, loading, signedIn } = useAccount();
  const history = useHistory(user?.uid);

  const name = profile?.username || user?.displayName || "Guest Viewer";
  const email = profile?.email || user?.email || "Not signed in";
  const historyVideos = history.map((h) => ({
    ...videoFromId(h.videoId),
    id: h.videoId,
    title: h.title,
    uploader: h.uploader ?? "Sexplosive",
    views: "Watched",
    age: h.watchedAt ? new Date(h.watchedAt).toLocaleDateString() : "Just now",
  }));


  return (
    <SiteLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4 rounded-3xl surface-card sheen p-5">
          <img src={img(user?.uid ?? "me", 160, 160)} alt={name} className="size-20 rounded-2xl object-cover" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-xl font-bold">{loading ? "Loading…" : name}</h1>
            <p className="truncate text-sm text-muted-foreground">{loading ? "" : email}</p>
            {profile?.premium && (
              <span className="mt-1 inline-block rounded-full bg-gold/20 px-3 py-0.5 text-[11px] font-semibold text-gold">
                Premium
              </span>
            )}
          </div>
          {signedIn ? (
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={async () => {
                await logOut();
                toast.success("Signed out");
                navigate({ to: "/" });
              }}
            >
              <LogOut className="mr-2 size-4" /> Log out
            </Button>
          ) : (
            <Button asChild className="rounded-full">
              <Link to="/login">Log in</Link>
            </Button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Tile to="/premium" icon={<Crown className="size-5 text-gold" />} label="Go Premium" />
          <Tile to="/streamer" icon={<Radio className="size-5 text-primary" />} label="Join streaming" />
          <Tile to="/extension" icon={<Puzzle className="size-5 text-accent" />} label="Get extension" />
        </div>

        <section>
          <h2 className="mb-4 font-display text-xl font-bold">Watch history</h2>
          {historyVideos.length ? (
            <VideoGrid videos={historyVideos} />
          ) : (
            <p className="rounded-2xl surface-card p-5 text-sm text-muted-foreground">
              {signedIn
                ? "Nothing here yet — videos you watch appear instantly."
                : "Log in to track your watch history."}
            </p>
          )}
        </section>

      </div>
    </SiteLayout>
  );
}

function Tile({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl surface-card px-4 py-4 text-sm font-medium tilt-hover"
    >
      {icon}
      {label}
    </Link>
  );
}
