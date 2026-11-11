# Service setup remaining

The supplied M-Pesa, Paystack and Truehost credentials are examples. They have not been stored as real secrets or used to claim successful payment/email.

## Google Analytics
Browser tracking is linked. Public page views and navigation clicks are tracked; private console paths are excluded. A tracking ID does not grant GA4 report access. In-console reporting still requires reporting authorization and a server-verified administrator identity; the existing browser-only console password cannot secure a privileged reporting endpoint. Missing reports show unavailable, not invented numbers.

## Payments
Requested providers: M-Pesa, Paystack and PayPal. Public M-Pesa shortcode is configured.
All checkout screens include a country selector (Kenya by default), local-currency estimates from ExchangeRate-API's public USD feed, and Kenya-only M-Pesa. If rates cannot be loaded the original USD price is retained, not relabeled. Estimates do not determine trusted payment amounts.
PayPal uses the requested live mode and public API URL `https://api-m.paypal.com`. `YOUR_LIVE_CLIENT_ID` and `YOUR_LIVE_CLIENT_SECRET` are examples, not credentials. PayPal buttons are present but cannot charge or unlock access. Real `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`, secure server-side order creation/capture/verification, and verified merchant approval are still needed.
Required secrets: `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY`, `PAYSTACK_SECRET_KEY`.
Required configuration: `MPESA_SHORTCODE`, `PAYSTACK_PUBLIC_KEY`, real `MPESA_CALLBACK_URL` and `PAYSTACK_CALLBACK_URL`, provider-approved merchant account, currencies and verified payment processing.
No STK push, Paystack checkout or callbacks have been implemented or deployed. Do not send callbacks to example.com. Existing browser actions cannot mark unverified payments paid or grant entitlements.
Next implementation must initiate checkout server-side, derive prices from product configuration, independently verify transactions, and grant access after idempotent trusted confirmation. Never trust browser prices, redirects or unsigned callbacks.

## Truehost mail
Public sender, aliases and SMTP port are configured. Delivery is not connected.
Required secrets: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`; configuration `SMTP_PORT`.
A secure server-authorized transport compatible with the hosted runtime is required. SMTP passwords must never enter browser code. The current console password cannot authorize server operations.
Compose supports local drafts; Send reports unavailable without creating fake sent messages. Actual mailboxes and forwarders must be set up at Truehost.

Never commit secret-bearing environment files. Supply actual credentials through secure project secret forms.