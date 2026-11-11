import { requireVerifiedPayment, serviceConfig } from "@/lib/integration-config";
import type { PaymentMethod } from "@/lib/checkout-country";

export const MPESA_PAYBILL = serviceConfig.mpesa.shortcode;
export const MPESA_ACCOUNT = "VHXTUBE";

export type PaymentKind = "premium" | "api" | "extension" | "stream";

/** Browser actions cannot grant unverified paid entitlements. */
export async function recordPayment(opts: {
  uid: string;
  kind: PaymentKind;
  amount: number;
  method: PaymentMethod;
  meta?: Record<string, unknown>;
}) {
  void opts;
  requireVerifiedPayment();
}

export function makeApiKey() {
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `vhx_live_${rand}`;
}
