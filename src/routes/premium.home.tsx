import { useReferralPremium } from "@/lib/referral";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HeroSlider } from "@/components/site/HeroSlider";
import { CategoryBox } from "@/components/site/CategoryBox";
import { VideoGrid } from "@/components/site/VideoGrid";
import { useQuery } from "@tanstack/react-query";
import { fetchSearch } from "@/lib/api-client";
import { useAccount } from "@/lib/account";

export const Route = createFileRoute("/premium/home")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Premium home — Sexplosive" },
      { name: "description", content: "Your premium Sexplosive feed with leaks and exclusive drops." },
      { property: "og:title", content: "Premium home — Sexplosive" },
      { property: "og:description", content: "Premium feed with leaks and exclusive drops." },
    ],
  }),
  component: PremiumHome,
});

function PremiumHome() {
  const { profile, loading } = useAccount();
  const referral = useReferralPremium();
  const premiumFeed = useQuery({
    queryKey: ["premium-home"],
    queryFn: () => fetchSearch("exclusive drops", { pages: 3, limit: 8 }),
  });

  if (!loading && !profile?.premium && !referral.active) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md rounded-3xl surface-card sheen p-6 text-center">
          <h1 className="font-display text-xl font-bold glow-text">Premium members only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Activate a Premium membership to open leaks and exclusive drops.
          </p>
          <Link
            to="/premium"
            className="mt-4 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
          >
            Go to Premium
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="space-y-8">
        <HeroSlider />
        <CategoryBox withLeaks videos={premiumFeed.data?.videos} />
        <section>
          <h1 className="mb-4 font-display text-2xl font-bold sm:text-3xl glow-text">
            Premium selection
          </h1>
          <VideoGrid
            videos={premiumFeed.data?.videos ?? []}
            loading={premiumFeed.isPending}
            error={premiumFeed.error ? premiumFeed.error.message : null}
            skeletonCount={12}
          />
        </section>
      </div>
    </SiteLayout>
  );
}
