import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mic, MicOff, PhoneOff, SwitchCamera, Video } from "lucide-react";
import { toast } from "sonner";
import { useCamera } from "@/hooks/use-camera";
import { img } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Live room — Sexplosive" },
      { name: "description", content: "You are connected to a live Sexplosive video room." },
      { property: "og:title", content: "Live room — Sexplosive" },
      { property: "og:description", content: "Connected to a live Sexplosive video room." },
    ],
  }),
  component: Live,
});

function Live() {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(false);
  const [front, setFront] = useState(true);
  const { videoRef, ready, setMuted: setTrackMuted } = useCamera(true, front ? "user" : "environment", true);

  return (
    <div className="relative min-h-screen bg-background">
      <img
        src={img("live-main", 1080, 1920)}
        alt="Live stream"
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-transparent to-background/90" />

      <div className="relative flex min-h-screen flex-col p-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-live px-3 py-1 text-xs font-bold text-primary-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-primary-foreground" /> LIVE
          </span>
          <span className="rounded-full bg-background/60 px-3 py-1 text-xs">00:42</span>
        </div>

        <div className="absolute right-4 top-16 h-40 w-28 overflow-hidden rounded-2xl border border-border bg-secondary shadow-[var(--shadow-3d)]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn("size-full object-cover", front && "scale-x-[-1]")}
          />
          {!ready && (
            <span className="absolute inset-0 grid place-items-center text-[10px] text-muted-foreground">
              Camera…
            </span>
          )}
        </div>


        <div className="mt-auto flex items-center justify-center gap-4 pb-6">
          <Ctl
            onClick={() => {
              const next = !muted;
              setMuted(next);
              setTrackMuted(next);
            }}
            active={muted}
          >
            {muted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
          </Ctl>
          <Ctl
            onClick={() => {
              setFront((f) => !f);
              toast(`Switched to ${front ? "back" : "front"} camera`);
            }}
          >
            <SwitchCamera className="size-6" />
          </Ctl>
          <Ctl>
            <Video className="size-6" />
          </Ctl>
          <button
            onClick={() => navigate({ to: "/" })}
            aria-label="End call"
            className="grid size-16 place-items-center rounded-full bg-destructive text-destructive-foreground shadow-[var(--shadow-glow)]"
          >
            <PhoneOff className="size-7" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Ctl({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "grid size-14 place-items-center rounded-full backdrop-blur transition-colors",
        active ? "bg-primary text-primary-foreground" : "bg-background/70",
      )}
    >
      {children}
    </button>
  );
}
