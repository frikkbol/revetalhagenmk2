"use client";

import { formatEventDateRange } from "@/lib/event-date-format";
import { authClient } from "@/server/auth/client";
import { api, type RouterOutputs } from "@/trpc/react";
import { format, startOfWeek } from "date-fns";
import { nb } from "date-fns/locale";
import {
  ArrowRight,
  CalendarDays,
  ClockIcon,
  MapPin,
  PlusIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "./button";
import { Card } from "./card";

type EventItem = {
  id: number;
  title: string | null;
  start: Date;
  end: Date;
  preview: string | null;
  location: string | null;
  image: string | null;
};

function EventCard({ event }: { event: EventItem }) {
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(event.image) && !imageError;

  const dayNumber = format(event.start, "d", { locale: nb });
  const monthShort = format(event.start, "MMM", { locale: nb }).replace(
    ".",
    "",
  );

  return (
    <Link
      href={`/arrangementer/${event.id}`}
      className="group block focus-visible:outline-none"
    >
      <Card className="hover:border-primary/30 group-focus-visible:ring-ring flex flex-col gap-0 overflow-hidden p-0 transition-all duration-200 group-focus-visible:ring-2 hover:shadow-md md:flex-row">
        {showImage && event.image && (
          <div className="bg-muted relative h-48 w-full shrink-0 overflow-hidden md:h-auto md:w-64 lg:w-72">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.image}
              alt={event.title ?? "Arrangement"}
              loading="lazy"
              onError={() => setImageError(true)}
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        <div className="flex flex-1 items-start gap-4 p-5 md:gap-5 md:p-6">
          <div className="bg-secondary text-secondary-foreground flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl">
            <span className="text-xl leading-none font-bold">{dayNumber}</span>
            <span className="mt-0.5 text-[11px] font-semibold tracking-wider uppercase">
              {monthShort}
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h2 className="text-foreground group-hover:text-primary text-lg leading-snug font-semibold transition-colors md:text-xl">
              {event.title}
            </h2>

            {event.preview && (
              <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                {event.preview}
              </p>
            )}

            <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon size={15} className="text-primary/70 shrink-0" />
                {formatEventDateRange(event.start, event.end)}
              </span>

              {event.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={15} className="text-primary/70 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </span>
              )}
            </div>

            <div className="pt-2">
              <span className="text-primary inline-flex items-center gap-1.5 text-sm font-medium">
                Les mer
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function EventListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="flex flex-row gap-5 p-6">
          <div className="bg-muted h-14 w-14 shrink-0 animate-pulse rounded-2xl" />
          <div className="flex flex-1 flex-col gap-3">
            <div className="bg-muted h-6 w-2/3 animate-pulse rounded-lg" />
            <div className="bg-muted h-4 w-full animate-pulse rounded-lg" />
            <div className="bg-muted h-4 w-1/3 animate-pulse rounded-lg" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function EventCalendar({
  initialEvents,
}: {
  initialEvents?: RouterOutputs["events"]["getEvents"];
}) {
  const { data: session } = authClient.useSession();
  const from = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);
  const {
    data: events,
    isPending,
    isError,
  } = api.events.getEvents.useQuery(
    {
      from,
    },
    {
      initialData: initialEvents,
    },
  );

  const groupedEvents = useMemo(() => {
    if (!events) return [];

    const groups = events
      .slice()
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .reduce<Record<string, EventItem[]>>((acc, event) => {
        const key = `${event.start.getFullYear()}-${String(event.start.getMonth() + 1).padStart(2, "0")}`;
        (acc[key] ??= []).push(event);
        return acc;
      }, {});

    return Object.entries(groups);
  }, [events]);

  return (
    <div className="flex w-full flex-col gap-8">
      {session?.user.role === "admin" && (
        <div>
          <Button asChild className="w-full md:w-fit">
            <Link href="/arrangementer/ny">
              <PlusIcon /> Opprett arrangement
            </Link>
          </Button>
        </div>
      )}

      {isPending && <EventListSkeleton />}

      {isError && (
        <Card className="items-center p-10 text-center">
          <p className="text-foreground font-medium">
            Kunne ikke laste inn arrangementer akkurat nå.
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Prøv å laste siden på nytt om et øyeblikk.
          </p>
        </Card>
      )}

      {!isPending &&
        !isError &&
        groupedEvents.map(([key, monthEvents]) => {
          const firstEvent = monthEvents[0];
          const monthLabel = firstEvent?.start
            ? format(firstEvent.start, "LLLL yyyy", { locale: nb })
            : "";

          return (
            <section key={key} className="flex w-full flex-col gap-4">
              {monthLabel && (
                <div className="flex items-center gap-4">
                  <h3 className="text-foreground shrink-0 text-lg font-semibold capitalize">
                    {monthLabel}
                  </h3>
                  <div className="bg-border h-px flex-1" />
                  <span className="text-muted-foreground shrink-0 text-xs font-medium">
                    {monthEvents.length}{" "}
                    {monthEvents.length === 1 ? "arrangement" : "arrangementer"}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-4">
                {monthEvents.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            </section>
          );
        })}

      {!isPending && !isError && groupedEvents.length === 0 && (
        <Card className="items-center gap-3 p-12 text-center">
          <div className="bg-secondary/60 text-secondary-foreground flex h-12 w-12 items-center justify-center rounded-2xl">
            <CalendarDays size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-foreground text-lg font-semibold">
              Ingen kommende arrangementer
            </h2>
            <p className="text-muted-foreground max-w-md text-sm">
              Det er ingen planlagte arrangementer akkurat nå. Kom gjerne
              tilbake senere for å se hva som skjer i hagen.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

export default EventCalendar;
