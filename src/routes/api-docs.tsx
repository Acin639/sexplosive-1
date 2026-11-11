import { PageClosedGate } from "@/components/site/PageClosedGate";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, Lock, Check } from "lucide-react";
import { toast } from "sonner";
import { ref, serverTimestamp, update } from "firebase/database";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccount } from "@/lib/account";
import { db } from "@/lib/firebase";
import { makeApiKey, recordPayment } from "@/lib/payments";
import { PaymentCheckout } from "@/components/site/PaymentCheckout";
import { normalizeMpesaPhone } from "@/components/site/MpesaCheckout";
import type { PaymentMethod } from "@/lib/checkout-country";

export const Route = createFileRoute("/api-docs")({
  head: () => ({
    meta: [
      { title: "VHX API — Developer Docs" },
      { name: "description", content: "Embed Sexplosive video and live streaming with the VHX API." },
      { property: "og:title", content: "VHX API — Developer Docs" },
      { property: "og:description", content: "Embed Sexplosive video and live streaming." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (<PageClosedGate page="api"><ApiPage /></PageClosedGate>),
});

const ENDPOINTS = [
  { m: "GET", p: "/v1/videos", d: "List trending and category videos" },
  { m: "GET", p: "/v1/videos/:id", d: "Fetch a single video with playback URL" },
  { m: "POST", p: "/v1/connect/match", d: "Request a live match session token" },
  { m: "GET", p: "/v1/streamers", d: "List premium streamers and availability" },
];

const PERKS = [
  "Personal API account + dashboard",
  "50,000 requests / month",
  "Live match session tokens",
  "Email support from the VHX team",
];

const PRICE = 49;

function ApiPage() {
  const navigate = useNavigate();
  const { user, profile, signedIn } = useAccount();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const paid = Boolean(profile?.apiAccount);

  const pay = async (method: PaymentMethod, msisdn?: string) => {
    if (!user) {
      toast.error("Log in to create an API account");
      navigate({ to: "/login" });
      return;
    }
    if (!email.includes("@") || (method === "mpesa" && !normalizeMpesaPhone(msisdn ?? ""))) {
      toast.error("Enter a billing email and, for M-Pesa, a valid phone number");
      return;
    }
    setLoading(true);
    try {
      const key = makeApiKey();
      await recordPayment({
        uid: user.uid,
        kind: "api",
        amount: PRICE,
        method,
        meta: { billingEmail: email.trim(), phone: msisdn },
      });
      await update(ref(db, `users/${user.uid}`), {
        apiKey: key,
        apiCreatedAt: serverTimestamp(),
      });
      toast.success("Payment received — API account created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl space-y-5">
        <header>
          <h1 className="font-display text-2xl font-bold sm:text-3xl glow-text">VHX API</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build on the vhx engine. Bearer-token auth, JSON everywhere.
          </p>
        </header>

        {!paid ? (
          <div className="space-y-4 rounded-3xl surface-card sheen p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent/20 text-accent">
                <Lock className="size-6" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold">Get an API account — ${PRICE} / month</h2>
                <p className="text-sm text-muted-foreground">Pay once to unlock your key and the full docs.</p>
              </div>
            </div>

            <ul className="space-y-2">
              {PERKS.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" /> {p}
                </li>
              ))}
            </ul>

            {!signedIn && (
              <p className="rounded-2xl bg-accent/10 p-3 text-xs text-accent">
                <Link to="/login" className="underline">
                  Log in
                </Link>{" "}
                or{" "}
                <Link to="/signup" className="underline">
                  create an account
                </Link>{" "}
                so your API key is saved to your profile.
              </p>
            )}

            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Billing email" maxLength={255} />
            <PaymentCheckout amount={PRICE} loading={loading} onPay={pay} />
          </div>
        ) : (
          <div className="rounded-3xl surface-card sheen p-6">
            <div className="flex items-center gap-3">
              <KeyRound className="size-6 text-gold" />
              <div className="min-w-0">
                <p className="font-display text-base font-bold">Your API key</p>
                <p className="truncate font-mono text-sm text-accent">{profile?.apiKey ?? "generating…"}</p>
              </div>
            </div>
          </div>
        )}

        <div className={paid ? "" : "pointer-events-none select-none opacity-40 blur-[2px]"}>
          <div className="overflow-hidden rounded-3xl surface-card">
            {ENDPOINTS.map((e) => (
              <div key={e.p} className="flex items-center gap-3 border-b border-border/60 p-4 last:border-0">
                <span className="shrink-0 rounded-md bg-accent/15 px-2 py-1 font-mono text-[11px] font-bold text-accent">
                  {e.m}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm">{e.p}</p>
                  <p className="truncate text-xs text-muted-foreground">{e.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
