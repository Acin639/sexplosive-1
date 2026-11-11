import { useState } from "react";
import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MPESA_PAYBILL } from "@/lib/payments";

export function normalizeMpesaPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (/^0[17]\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^254[17]\d{8}$/.test(digits)) return digits;
  if (/^[17]\d{8}$/.test(digits)) return `254${digits}`;
  return null;
}

export function MpesaCheckout({
  amount,
  loading,
  disabled = false,
  displayAmount,
  onPay,
  label = "Pay with M-Pesa",
}: {
  amount: number;
  loading?: boolean;
  disabled?: boolean;
  displayAmount?: string;
  onPay: (phone: string) => void;
  label?: string;
}) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const valid = normalizeMpesaPhone(phone);

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-3 rounded-2xl bg-accent/10 p-3">
        <Smartphone className="size-5 shrink-0 text-accent" />
        <p className="min-w-0 text-xs text-accent">
          M-Pesa · {displayAmount ?? `US$${amount}`} · Shortcode {MPESA_PAYBILL}. Payments are not connected yet.
        </p>
      </div>
      <Input
        placeholder="M-Pesa number (07xx xxx xxx)"
        inputMode="tel"
        value={phone}
        maxLength={15}
        aria-label="M-Pesa number"
        disabled={disabled || loading}
        onChange={(e) => {
          setPhone(e.target.value);
          setError(null);
        }}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button
        className="w-full rounded-full"
        disabled={disabled || loading}
        onClick={() => {
          if (!valid) {
            setError("Enter a valid Safaricom number");
            return;
          }
          onPay(valid);
        }}
      >
        {loading ? "Waiting for M-Pesa…" : label}
      </Button>
    </div>
  );
}
