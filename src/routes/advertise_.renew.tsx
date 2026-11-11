import { createFileRoute } from "@tanstack/react-router";
import { RenewFlow } from "@/components/site/AdvertiseFlows";
import { AdvertiseWizard } from "@/components/site/AdvertiseWizard";

export const Route = createFileRoute("/advertise_/renew")({
  head: () => ({ meta: [
    { title: "Renew Your Advertising Campaign — Sexplosive" },
    { name: "description", content: "Sign in and renew your Sexplosive advertising campaign." },
    { property: "og:title", content: "Renew Your Advertising Campaign — Sexplosive" },
    { property: "og:description", content: "Renew your campaign with your preferred package and duration." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <AdvertiseWizard mode="renew"><RenewFlow /></AdvertiseWizard>,
});