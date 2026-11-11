import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import peachLogo from "@/assets/peach-logo.png";
import { Button } from "@/components/ui/button";
import { CONSENT_KEY, useConsentEnabled } from "@/lib/consent";

/** Bottom notice asking a first-time visitor to confirm they are 18+. */
export function ConsentGate() {
  const enabled = useConsentEnabled();
  const [accepted, setAccepted] = useState(true);
  useEffect(() => setAccepted(localStorage.getItem(CONSENT_KEY) === "yes"), []);
  const show = enabled === true && !accepted;
  if (!show) return null;

  const enter = () => {
    localStorage.setItem(CONSENT_KEY, "yes");
    setAccepted(true);
  };

  return (
    <div
      role="dialog"
      aria-modal={false}
      aria-labelledby="consent-title"
      className="fixed inset-x-3 bottom-3 z-[100] sm:left-4 sm:right-auto sm:bottom-4 sm:w-[min(28rem,calc(100vw-2rem))]"
    >
      <div className="rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 motion-reduce:animate-none">
        <div className="flex items-start gap-3">
          <img src={peachLogo} alt="" width={1024} height={1024} className="size-9 shrink-0 rounded-full" />
          <div className="min-w-0 space-y-1">
            <h2 id="consent-title" className="font-display text-base font-bold leading-snug">
              Adults only — are you 18 or older?
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              This site contains age-restricted material. By entering you confirm you are of legal age where you live and
              accept our <Link to="/terms" className="text-accent underline">terms of use</Link>.
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" className="rounded-full" onClick={enter}>
            I'm 18 or older — Enter
          </Button>
          <Button size="sm" variant="secondary" className="rounded-full" onClick={() => window.location.assign("https://www.google.com")}>
            I'm under 18 — Leave
          </Button>
        </div>
      </div>
    </div>
  );
}
