import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { PaymentCheckout } from "@/components/site/PaymentCheckout";
import type { PaymentMethod } from "@/lib/checkout-country";
import { img, STREAMERS } from "@/lib/mock-data";
import { useAccount } from "@/lib/account";
import { recordPayment } from "@/lib/payments";

export const Route = createFileRoute("/pay/$streamerId")({
  validateSearch: (s: Record<string, unknown>) => ({ type: String(s.type ?? "Personal") }),
  head: () => ({
    meta: [
      { title: "Checkout — Sexplosive" },
      { name: "description", content: "Pay to join a premium Sexplosive live stream." },
      { property: "og:title", content: "Checkout — Sexplosive" },
      { property: "og:description", content: "Pay to join a premium Sexplosive live stream." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pay,
});

function Pay() {
  const { streamerId } = Route.useParams();
  const { type } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAccount();
  const [loading, setLoading] = useState(false);
  const streamer = STREAMERS.find((s) => s.id === streamerId) ?? STREAMERS[0];

  const payNow = async (method: PaymentMethod, phone?: string) => {
    if (!user) {
      toast.error("Log in to pay for a stream");
      navigate({ to: "/login" });
      return;
    }
    setLoading(true);
    try {
      await recordPayment({
        uid: user.uid,
        kind: "stream",
        amount: streamer.price,
        method,
        meta: { streamerId: streamer.id, streamerName: streamer.name, streamType: type, streamerCut: streamer.price * 0.6, ...(phone ? { phone } : {}) },
      });
      toast.success("Payment confirmed");
      navigate({ to: "/live" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-lg space-y-5">
        <div className="flex items-center gap-4 rounded-3xl surface-card p-4">
          <img src={img(streamer.seed, 160, 160)} alt={streamer.name} className="size-16 rounded-2xl object-cover" />
          <div className="min-w-0">
            <h1 className="truncate font-display text-lg font-bold">{streamer.name}</h1>
            <p className="text-sm text-muted-foreground">
              {type} stream · ${streamer.price}
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-3xl surface-card p-5">
          <h2 className="font-display text-base font-bold">Payment</h2>
          <PaymentCheckout amount={streamer.price} loading={loading} onPay={payNow} />
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-accent" /> Secure checkout. Streamers keep 60%.
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
