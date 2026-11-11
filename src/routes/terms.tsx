import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Sexplosive" },
      {
        name: "description",
        content:
          "Read the Sexplosive terms and conditions covering accounts, streaming, payouts, premium access and acceptable use.",
      },
      { property: "og:title", content: "Terms & Conditions — Sexplosive" },
      {
        property: "og:description",
        content: "Accounts, streaming rules, payouts, premium access and acceptable use on Sexplosive.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. Eligibility",
    body: [
      "You must be at least 18 years old to create an account, connect to a live room, or purchase premium access.",
      "By using Sexplosive you confirm that adult content is legal in your jurisdiction.",
    ],
  },
  {
    title: "2. Accounts & stealth mode",
    body: [
      "You are responsible for activity on your account and for keeping your credentials private.",
      "Stealth mode hides your presence from other users but does not anonymise payment records.",
    ],
  },
  {
    title: "3. Live connect rooms",
    body: [
      "Random connect matches you with other consenting adults. Recording, screenshotting or redistributing a session is strictly prohibited.",
      "Camera and microphone access is used only for the duration of an active room and is never stored by Sexplosive.",
    ],
  },
  {
    title: "4. Streamers & payouts",
    body: [
      "Approved streamers receive 60% of every stream payment. The remaining 40% covers processing, bandwidth and platform operations.",
      "Payouts are sent via M-Pesa to the number on file, and streamers are responsible for their own taxes.",
    ],
  },
  {
    title: "5. Premium & extension purchases",
    body: [
      "Premium access and extension licences are billed per the price shown at checkout and unlock immediately after payment.",
      "Digital purchases are non-refundable once the content or download has been accessed.",
    ],
  },
  {
    title: "6. Acceptable use",
    body: [
      "No minors, no non-consensual content, no harassment, no impersonation, no scraping and no automated access outside the documented API.",
      "Accounts that breach these rules are terminated without refund.",
    ],
  },
  {
    title: "7. Changes",
    body: [
      "These terms may be updated as the platform evolves. Continued use after an update means you accept the revised terms.",
    ],
  },
];

function TermsPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="rounded-3xl surface-card sheen p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Legal</p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl glow-text">
            Terms &amp; Conditions
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated {new Date().getFullYear()}. These terms govern your use of Sexplosive, its
            live connect rooms, premium feed and streamer programme.
          </p>
        </header>

        <div className="space-y-5">
          {SECTIONS.map((s) => (
            <section key={s.title} className="rounded-2xl surface-card p-5 sm:p-7">
              <h2 className="font-display text-lg font-bold sm:text-xl">{s.title}</h2>
              <div className="mt-3 space-y-2">
                {s.body.map((p) => (
                  <p key={p} className="text-sm leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
