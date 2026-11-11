import { PageClosedGate } from "@/components/site/PageClosedGate";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Puzzle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { PaymentCheckout } from "@/components/site/PaymentCheckout";
import type { PaymentMethod } from "@/lib/checkout-country";
import { useAccount } from "@/lib/account";
import { recordPayment } from "@/lib/payments";

export const Route = createFileRoute("/extension")({
  head: () => ({
    meta: [
      { title: "Sexplosive Extension — Download" },
      {
        name: "description",
        content: "Buy and download the Sexplosive browser extension for one-click streaming.",
      },
      { property: "og:title", content: "Sexplosive Extension — Download" },
      { property: "og:description", content: "Buy and download the Sexplosive browser extension." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (<PageClosedGate page="extension"><ExtensionPage /></PageClosedGate>),
});

const PRICE = 9;

function ExtensionPage() {
  const navigate = useNavigate();
  const { user, profile, signedIn } = useAccount();
  const [loading, setLoading] = useState(false);
  const paid = Boolean(profile?.extension);

  const pay = async (method: PaymentMethod, phone?: string) => {
    if (!user) {
      toast.error("Log in to buy the extension");
      navigate({ to: "/login" });
      return;
    }
    setLoading(true);
    try {
      await recordPayment({ uid: user.uid, kind: "extension", amount: PRICE, method, meta: phone ? { phone } : undefined });
      toast.success("Payment received — download unlocked");
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
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent/20 text-accent">
            <Puzzle className="size-7" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold">Sexplosive Extension</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            One-click capture, stealth browsing and instant connect from any tab. ${PRICE} one-time.
          </p>
        </div>

        {paid ? (
          <div className="space-y-3 rounded-3xl surface-card p-5 text-center">
            <p className="text-sm text-muted-foreground">Your license is active.</p>
            <Button className="w-full rounded-full" onClick={() => toast("Download starting…")}>
              <Download className="mr-2 size-4" /> Download extension
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
                to attach the license to your profile.
              </p>
            )}
            <PaymentCheckout amount={PRICE} loading={loading} onPay={pay} />
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-accent" /> Secure checkout
            </p>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
