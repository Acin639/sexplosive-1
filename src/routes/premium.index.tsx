import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Crown, Check, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { PaymentCheckout } from "@/components/site/PaymentCheckout";
import type { PaymentMethod } from "@/lib/checkout-country";
import { useAccount } from "@/lib/account";
import { recordPayment } from "@/lib/payments";

export const Route = createFileRoute("/premium/")({
  head: () => ({
    meta: [
      { title: "Premium — Sexplosive Membership" },
      {
        name: "description",
        content: "Unlock leaks, exclusive drops and ad-free streaming with Sexplosive Premium.",
      },
      { property: "og:title", content: "Premium — Sexplosive Membership" },
      {
        property: "og:description",
        content: "Unlock leaks, exclusive drops and ad-free streaming.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PremiumGate,
});

const PERKS = [
  "Leaks category — first access",
  "Ad-free, 4K streaming",
  "Priority matching on Connect",
  "Exclusive premium streamer rooms",
];

const PRICE = 14.99;

function PremiumGate() {
  const navigate = useNavigate();
  const { user, profile, signedIn } = useAccount();
  const [loading, setLoading] = useState(false);

  const pay = async (method: PaymentMethod, phone?: string) => {
    if (!user) {
      toast.error("Log in to buy Premium");
      navigate({ to: "/login" });
      return;
    }
    setLoading(true);
    try {
      await recordPayment({ uid: user.uid, kind: "premium", amount: PRICE, method, meta: phone ? { phone } : undefined });
      toast.success("Premium activated");
      navigate({ to: "/premium/home" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-lg space-y-5">
        <div className="rounded-3xl surface-card sheen p-6 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-gold/20 text-gold">
            <Crown className="size-7" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold glow-text">Sexplosive Premium</h1>
          <p className="mt-1 text-sm text-muted-foreground">${PRICE} / month · cancel anytime</p>
          <ul className="mt-5 space-y-2 text-left">
            {PERKS.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" /> {p}
              </li>
            ))}
          </ul>
        </div>

        {profile?.premium ? (
          <div className="space-y-3 rounded-3xl surface-card p-5 text-center">
            <p className="text-sm text-muted-foreground">Your membership is active.</p>
            <Button className="w-full rounded-full" onClick={() => navigate({ to: "/premium/home" })}>
              Enter Premium
            </Button>
          </div>
        ) : (
          <div className="space-y-3 rounded-3xl surface-card p-5">
            {!signedIn && (
              <p className="rounded-2xl bg-accent/10 p-3 text-xs text-accent">
                <Link to="/login" className="underline">
                  Log in
                </Link>{" "}
                or{" "}
                <Link to="/signup" className="underline">
                  create an account
                </Link>{" "}
                to activate Premium on your profile.
              </p>
            )}
            <PaymentCheckout amount={PRICE} loading={loading} onPay={pay} />
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
