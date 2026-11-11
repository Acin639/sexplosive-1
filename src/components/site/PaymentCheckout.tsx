import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Globe2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MpesaCheckout } from "./MpesaCheckout";
import { CHECKOUT_COUNTRIES, DEFAULT_COUNTRY, convertUsd, currencyForCountry, mpesaAvailable, type PaymentMethod } from "@/lib/checkout-country";

async function exchangeRates(): Promise<{ rates: Record<string, number>; updated: string }> {
  const response = await fetch("https://open.er-api.com/v6/latest/USD");
  if (!response.ok) throw new Error("Exchange rates unavailable");
  const data = await response.json();
  if (data.result !== "success" || !data.rates) throw new Error("Exchange rates unavailable");
  return { rates: data.rates, updated: data.time_last_update_utc };
}

export function PaymentCheckout({ amount, loading = false, onPay }: {
  amount: number;
  loading?: boolean;
  onPay: (method: PaymentMethod, phone?: string) => void;
}) {
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const currency = currencyForCountry(country);
  const { data, isPending } = useQuery({ queryKey: ["checkout-exchange-rates"], queryFn: exchangeRates, staleTime: 3600000, retry: 1 });
  const converted = convertUsd(amount, currency, data?.rates ?? {});
  const displayAmount = converted === null ? `${currency} —` : new Intl.NumberFormat("en", { style: "currency", currency }).format(converted);
  const kenya = mpesaAvailable(country);
  return (
    <div className="space-y-4">
      <label className="block space-y-2">
        <span className="flex items-center gap-2 text-sm font-medium"><Globe2 className="size-4 text-accent" /> Country</span>
        <select aria-label="Payment country" className="h-12 w-full rounded-lg border border-input bg-background px-3 text-sm" value={country} disabled={loading} onChange={e => setCountry(e.target.value)}>
          {CHECKOUT_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </label>
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-4">
        <p className="font-display text-2xl font-bold text-primary" aria-live="polite">{displayAmount}</p>
        <span className="text-xs text-muted-foreground">{currency} · US${amount.toFixed(2)} base</span>
      </div>
      <p className="text-xs text-muted-foreground">{converted === null ? (isPending ? "Loading exchange rate…" : "Exchange rate unavailable. Base price remains in USD.") : currency === "USD" ? "USD price" : "Estimated conversion · final provider rate may differ."}</p>
      <MpesaCheckout amount={amount} displayAmount={displayAmount} loading={loading} disabled={!kenya} onPay={phone => { if (mpesaAvailable(country)) onPay("mpesa", phone); }} />
      {!kenya && <p className="text-xs text-muted-foreground">M-Pesa is available only in Kenya.</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline" className="h-12 rounded-lg" disabled={loading} onClick={() => onPay("card")}><CreditCard /> Pay by card</Button>
        <Button variant="outline" className="h-12 rounded-lg border-accent/50 text-accent" disabled={loading} onClick={() => onPay("paypal")}><Wallet /> PayPal</Button>
      </div>
      <p className="text-xs text-muted-foreground">Card and PayPal are not connected. No payment will be taken.</p>
    </div>
  );
}