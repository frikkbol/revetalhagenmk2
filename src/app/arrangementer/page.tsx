import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs";
import EventCalendar from "@/components/ui/event-calendar";
import { api } from "@/trpc/server";
import { startOfWeek } from "date-fns";
import { HomeIcon } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arrangementer",
  description:
    "Se kommende kurs, dugnader og sosiale sammenkomster i Revetalhagen.",
  alternates: {
    canonical: "/arrangementer",
  },
};

async function Page() {
  const initialEvents = await api.events.getEvents({
    from: startOfWeek(new Date(), { weekStartsOn: 1 }),
  });

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
        <h1 className="text-foreground flex w-fit flex-row flex-wrap items-center justify-start gap-x-2 text-left text-4xl leading-12 md:gap-4 md:text-6xl md:leading-20">
          <span>Hva</span>{" "}
          <span className="text-secondary-foreground bg-secondary inline-block rounded-3xl px-3">
            skjer
          </span>{" "}
          <span>i Revetalhagen?</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base md:text-lg">
          Her finner du en oversikt over kommende kurs, dugnader og sosiale
          sammenkomster i hagen.
        </p>
      </div>
      <div className="w-full pt-2">
        <EventCalendar initialEvents={initialEvents} />
      </div>
    </div>
  );
}

export default Page;
