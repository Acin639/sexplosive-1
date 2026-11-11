/** Public configuration only. Real credentials belong in project secrets. */
export const serviceConfig = {
  mpesa: { shortcode: "174379", configured: false },
  paystack: { configured: false },
  paypal: { mode: "live", apiUrl: "https://api-m.paypal.com", configured: false },
  smtp: { port: 587, from: "admin@sexplosive.com", configured: false },
} as const;
export const emailAliases = {
  admin: "admin@sexplosive.com", support: "support@sexplosive.com",
  info: "info@lonestream.com", contact: "contact@sexplosive.com",
  reports: "reports@sexplosive.com", advertise: "advertise@sexplosive.com",
  billing: "billing@sexplosive.com", notifications: "notifications@sexplosive.com",
} as const;
export function requireVerifiedPayment() {
  throw new Error("Payments are unavailable until M-Pesa, Paystack or PayPal is connected and the payment is verified. No charge was made.");
}