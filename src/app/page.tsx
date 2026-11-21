import Hero from "@/components/screen/hero";
import PromotionalVideo from "@/components/screen/promotional-video";
import LandingEventList from "@/components/ui/landing-event-list";
import LandingNewsList from "@/components/ui/landing-news-list";
import { api, HydrateClient } from "@/trpc/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revetalhagen",
  description:
    "Revetalhagen er et åpent og inkluderende møtested i Revetal. Se kommende arrangementer, les siste nytt, lei selskapslokale eller bli medlem.",
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  // if (typeof window === "undefined") {
  //   void api.post.getLatest.prefetch();
  // }
  const [events, latestNews] = await Promise.all([
    api.events.getEvents({
      from: new Date(),
    }),
    api.news.getLatest({
      limit: 3,
    }),
    api.cms.getContent.prefetch({
      slug: "hero-description",
    }),
  ]);

  return (
    <HydrateClient>
      <div className="h-fit w-full overflow-x-hidden">
        <section className="from-background via-accent/60 to-secondary/35 border-border/60 relative w-full overflow-hidden rounded-b-[2rem] border-b bg-gradient-to-b max-sm:pt-10 md:rounded-b-[3rem]">
          {/* Soft botanical ambient glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="bg-secondary/50 absolute -top-24 -right-24 h-80 w-80 rounded-full blur-3xl md:h-[28rem] md:w-[28rem]" />
            <div className="bg-primary/10 absolute -bottom-24 -left-24 h-80 w-80 rounded-full blur-3xl md:h-[26rem] md:w-[26rem]" />
            <div className="bg-accent/80 absolute top-1/3 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 mx-auto w-full max-w-[90rem] px-5 sm:px-8">
            <Hero />
          </div>
        </section>

        <div className="mx-auto w-full max-w-[90rem] px-1 py-5 sm:px-8 sm:py-12">
          <PromotionalVideo />
        </div>

        <section className="bg-accent/50 border-border/60 w-full border-y py-16 md:py-24">
          <div className="mx-auto w-full max-w-[90rem] px-1 sm:px-8">
            <LandingNewsList articles={latestNews} />
          </div>
        </section>

        <section className="w-full py-16 md:py-24">
          <div className="mx-auto w-full max-w-[90rem] px-1 sm:px-8">
            <LandingEventList events={events} />
          </div>
        </section>
        {/* <AboutUs /> */}
      </div>
    </HydrateClient>
  );
}
