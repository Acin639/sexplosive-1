import { useEffect, useState } from "react";
import { Copy, Check, Crown, Lightning } from "@phosphor-icons/react";
import { REFERRAL_TARGET, isSuperTuesday, shareLink, useReferralPremium } from "@/lib/referral";

/** Site's own promo shown as the first box of every video grid. */
export function SharePromoCard() {
  const { count, until, active } = useReferralPremium();
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [tuesday, setTuesday] = useState(false);
  useEffect(() => { setLink(shareLink()); setTuesday(isSuperTuesday(new Date())); }, []);

  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  };
  const done = Math.min(count, REFERRAL_TARGET);

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-accent/50 surface-card">
      <div className="relative flex aspect-video flex-col justify-center gap-1 overflow-hidden bg-gradient-to-br from-primary/40 via-accent/25 to-background p-4">
        <span className="absolute right-3 top-3 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent">Sexplosive</span>
        {tuesday ? <Lightning weight="fill" className="size-8 text-accent" /> : <Crown weight="fill" className="size-8 text-accent" />}
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-accent">{tuesday ? "Super Tuesday offer" : "Free premium"}</p>
        <h3 className="font-display text-xl font-extrabold leading-tight glow-text">
          {tuesday ? "Share with 5 people, get Premium all day" : "Share with 5 people, get Premium for 1 hour"}
        </h3>
      </div>
      <div className="space-y-2 p-3">
        <div className="flex gap-1">
          {Array.from({ length: REFERRAL_TARGET }).map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i < done ? "bg-accent" : "bg-secondary"}`} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {active ? `Premium unlocked until ${new Date(until).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : `${done}/${REFERRAL_TARGET} friends visited today`}
        </p>
        <button onClick={copy} disabled={!link} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform active:scale-95">
          {copied ? <Check weight="bold" className="size-4" /> : <Copy weight="bold" className="size-4" />}
          {copied ? "Link copied" : "Copy share link"}
        </button>
      </div>
    </div>
  );
}
