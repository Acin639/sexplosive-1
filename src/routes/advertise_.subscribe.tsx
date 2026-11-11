import { createFileRoute } from "@tanstack/react-router";
import { SubscribeFlow } from "@/components/site/AdvertiseFlows";
import { AdvertiseWizard } from "@/components/site/AdvertiseWizard";

export const Route = createFileRoute("/advertise_/subscribe")({
  head: () => ({ meta: [
    { title: "Start an Advertising Campaign — Sexplosive" },
    { name: "description", content: "Choose a Sexplosive advertising package and submit your campaign." },
    { property: "og:title", content: "Start an Advertising Campaign — Sexplosive" },
    { property: "og:description", content: "Choose your package, campaign details and payment options." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <AdvertiseWizard mode="subscribe"><SubscribeFlow /></AdvertiseWizard>,
});