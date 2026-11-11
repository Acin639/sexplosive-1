import { expect, it } from "vitest";
import { emailAliases, requireVerifiedPayment, serviceConfig } from "./integration-config";
it("uses the supplied M-Pesa shortcode", () => { expect(serviceConfig.mpesa.shortcode).toBe("174379"); });
it("uses SMTP port 587 and the requested sender", () => {
  expect(serviceConfig.smtp.port).toBe(587);
  expect(serviceConfig.smtp.from).toBe("admin@sexplosive.com");
});
it("preserves info and notifications aliases", () => {
  expect(emailAliases.info).toBe("info@lonestream.com");
  expect(emailAliases.notifications).toBe("notifications@sexplosive.com");
});
it("does not mark placeholder payments paid", () => { expect(() => requireVerifiedPayment()).toThrow("No charge was made"); });
it("keeps PayPal live configuration unconnected with placeholder credentials", () => {
  expect(serviceConfig.paypal.mode).toBe("live");
  expect(serviceConfig.paypal.apiUrl).toBe("https://api-m.paypal.com");
  expect(serviceConfig.paypal.configured).toBe(false);
});