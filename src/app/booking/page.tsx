import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs";
import BookingItemList from "@/components/screen/booking-item-list/booking-item-list";
import BookingWizard from "@/components/screen/booking-wizard";
import CreateBookingItem from "@/components/ui/create-booking-item";
import { HeroPill } from "@/components/ui/hero-pill";
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import { HomeIcon } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Booking",
  description:
    "Lei selskapslokale, møterom eller overnatting i Revetalhagen. Se ledige datoer, priser og send bookingforespørsel.",
  alternates: {
    canonical: "/booking",
  },
};

async function Booking() {
  const [session, initialItems] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    api.booking.getItems({}),
  ]);

  return (
    <div className="flex min-h-screen w-full flex-col gap-5 pt-20 pb-10">
      <DynamicBreadcrumbs
        className="mt-5 px-5 md:px-10"
        items={[
          { href: "/", label: "Hjem", icon: <HomeIcon size={16} /> },
          { href: "/booking", label: "Booking" },
        ]}
      />
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-2 px-5 text-center md:px-10">
        <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-5xl">
          Booking i Revetalhagen
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
          Lei selskapslokale, møterom eller overnatting i rolige og grønne
          omgivelser.
        </p>
      </div>
      <BookingWizard />

      <div className="px-5 md:px-10">
        <HeroPill
          className="mx-auto w-fit flex-wrap items-center justify-center rounded-md text-center whitespace-break-spaces md:flex md:rounded-full md:text-start"
          label="Alle soverom er dobbeltrom med tilgang til et fellesbad, kjøkken og stue."
          announcement="⚠️ Viktig informasjon"
        />
      </div>
      <BookingItemList initialItems={initialItems} />
      {session?.user.role?.includes("admin") && <CreateBookingItem />}
    </div>
  );
}

export default Booking;
