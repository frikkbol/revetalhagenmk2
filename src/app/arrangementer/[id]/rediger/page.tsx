import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs";
import EventEditor from "@/components/screen/event-editor";
import { Button } from "@/components/ui/button";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { event } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { ArrowLeftIcon, HomeIcon } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (!session.user.role?.includes("admin")) {
    redirect("/arrangementer");
  }

  const { id } = await params;
  const eventId = Number(id);
  if (Number.isNaN(eventId)) {
    notFound();
  }

  const eventItem = await db.query.event.findFirst({
    where: eq(event.id, eventId),
  });

  if (!eventItem) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 pt-24 pb-16 md:px-10 md:pt-32">
      <DynamicBreadcrumbs
        items={[
          { href: "/", label: "Hjem", icon: <HomeIcon size={16} /> },
          { href: "/arrangementer", label: "Arrangementer" },
          {
            href: `/arrangementer/${eventItem.id}`,
            label: eventItem.title ?? "Arrangement",
          },
          { href: `/arrangementer/${eventItem.id}/rediger`, label: "Rediger" },
        ]}
      />

      <div className="flex flex-col gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-3 w-fit">
          <Link href={`/arrangementer/${eventItem.id}`}>
            <ArrowLeftIcon />
            Tilbake til arrangementet
          </Link>
        </Button>
        <h1 className="text-foreground text-3xl font-semibold md:text-4xl">
          Rediger arrangement
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Oppdater detaljer, tidspunkt eller beskrivelse for{" "}
          {eventItem.title ? `«${eventItem.title}»` : "arrangementet"}.
        </p>
      </div>

      <EventEditor defaultEvent={eventItem} />
    </div>
  );
}
