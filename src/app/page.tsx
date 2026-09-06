import { AppShell } from "@/components/layout/AppShell";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { MarketingFaq } from "@/components/marketing/MarketingFaq";

export default function Home() {
  return (
    <>
      <MarketingHero />
      <AppShell />
      <MarketingFaq />
    </>
  );
}
