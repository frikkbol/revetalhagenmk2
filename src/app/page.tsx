import Hero from "@/components/screen/hero";
import PromotionalVideo from "@/components/screen/promotional-video";
import LandingEventList from "@/components/ui/landing-event-list";
import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
  // if (typeof window === "undefined") {
  //   void api.post.getLatest.prefetch();
  // }
  const events = await api.events.getEvents({
    from: new Date(),
  });

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

        <div className="mx-auto min-h-full w-full max-w-[90rem] px-1 sm:px-8">
          <div className="my-5 flex flex-col items-center gap-20 sm:my-20">
            <PromotionalVideo />
            <LandingEventList events={events} />
          </div>
          {/* <AboutUs /> */}
        </div>
      </div>
    </HydrateClient>
  );
}
