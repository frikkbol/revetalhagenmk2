import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs";
import SlideAnimation from "@/components/ui/animated/slide-animation";
import EventCalendar from "@/components/ui/event-calendar";
import { HomeIcon } from "lucide-react";

async function Page() {
  return (
    <div className="relative mx-auto flex max-w-5xl flex-col items-start gap-6 px-5 pt-24 pb-16 md:px-10 md:pt-36">
      <DynamicBreadcrumbs
        className="mt-5"
        items={[
          { href: "/", label: "Hjem", icon: <HomeIcon size={16} /> },
          { href: "/arrangementer", label: "Arrangementer" },
        ]}
      />
      <div className="flex flex-col gap-3">
        <h1 className="text-foreground flex w-fit flex-row flex-wrap justify-start gap-x-2 text-left text-4xl leading-12 md:gap-4 md:text-6xl md:leading-20">
          Hva
          <SlideAnimation
            direction="right"
            className="text-secondary-foreground bg-secondary w-fit overflow-hidden rounded-3xl px-3"
            transition={{
              delay: 0.4,
              duration: 0.3,
            }}
          >
            <SlideAnimation
              direction="up"
              className=""
              transition={{
                delay: 0.7,
              }}
            >
              skjer
            </SlideAnimation>
          </SlideAnimation>
          i Revetalhagen?
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base md:text-lg">
          Her finner du en oversikt over kommende kurs, dugnader og sosiale
          sammenkomster i hagen.
        </p>
      </div>
      <div className="w-full pt-2">
        <EventCalendar />
      </div>
    </div>
  );
}

export default Page;
