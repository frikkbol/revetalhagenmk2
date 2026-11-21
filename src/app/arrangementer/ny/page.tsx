import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs";
import EventEditor from "@/components/screen/event-editor";
import { Button } from "@/components/ui/button";
import { auth } from "@/server/auth";
import { ArrowLeftIcon, HomeIcon } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Nytt arrangement",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewEventPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (!session.user.role?.includes("admin")) {
    redirect("/arrangementer");
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 pt-24 pb-16 md:px-10 md:pt-32">
      <DynamicBreadcrumbs
        items={[
          { href: "/", label: "Hjem", icon: <HomeIcon size={16} /> },
          { href: "/arrangementer", label: "Arrangementer" },
          { href: "/arrangementer/ny", label: "Nytt arrangement" },
        ]}
      />

      <div className="flex flex-col gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-3 w-fit">
          <Link href="/arrangementer">
            <ArrowLeftIcon />
            Tilbake til arrangementer
          </Link>
        </Button>
        <h1 className="text-foreground text-3xl font-semibold md:text-4xl">
          Opprett arrangement
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Legg til et nytt arrangement i kalenderen til Revetalhagen.
        </p>
      </div>

      <EventEditor />
    </div>
  );
}
