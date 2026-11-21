import BookingItemCard from "@/components/screen/booking-item-list/booking-item-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BookingStatusMap } from "@/lib/booking-status-map";
import { api } from "@/trpc/server";
import { format } from "date-fns";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckCircle2,
  CircleX,
  ListCheck,
  UserIcon,
} from "lucide-react";

const Booking = async () => {
  const [bookings, accepted, completed, rejected, cancelled] =
    await Promise.all([
      api.booking.getBookings({ status: "pending" }),
      api.booking.getBookings({ status: "confirmed" }),
      api.booking.getBookings({ status: "completed" }),
      api.booking.getBookings({ status: "rejected" }),
      api.booking.getBookings({ status: "cancelled" }),
    ]);

  const pendingBookings = bookings.filter((booking) => booking.item !== null);
  const acceptedBookings = accepted.filter((booking) => booking.item !== null);
  const completedBookings = completed.filter(
    (booking) => booking.item !== null,
  );
  const rejectedBookings = rejected.filter((booking) => booking.item !== null);
  const cancelledBookings = cancelled.filter(
    (booking) => booking.item !== null,
  );

  const renderDescription = (booking: (typeof pendingBookings)[number]) => (
    <div>
      <div className="flex items-center gap-1">
        <UserIcon size={16} />
        {booking.name}
      </div>
      <span className="flex flex-row items-center gap-1">
        <CalendarIcon size={16} />
        {format(booking.from, "dd.MM.yyyy")} -{" "}
        {format(booking.to, "dd.MM.yyyy")}
      </span>
      <span className="flex flex-wrap items-center gap-2">
        <span className="flex flex-row items-center gap-1">
          <ListCheck size={16} /> {BookingStatusMap[booking.status]}
        </span>
        {booking.isPaid ? (
          <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
            <CheckCircle2 className="size-3" />
            Betalt
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            <CircleX className="size-3" />
            Ikke betalt
          </Badge>
        )}
      </span>
    </div>
  );

  return (
    <div className="w-full">
      <h1 className="text-3xl font-black md:text-6xl">Booking</h1>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          <h2>Aktive forespørsler</h2>
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
            {pendingBookings.map((booking) => (
              <BookingItemCard
                withImage={false}
                className="w-full md:w-full!"
                description={renderDescription(booking)}
                buttonContent={
                  <div className="flex flex-row items-center gap-2.5">
                    <Button>
                      <ArrowRightIcon /> Behandle
                    </Button>
                  </div>
                }
                key={booking.id}
                item={booking.item!}
                href={`/booking/status/${booking.reference}`}
              />
            ))}
            {pendingBookings.length === 0 && (
              <span>Det er ingen aktive forespørsler</span>
            )}
          </div>
        </div>

        <Separator orientation="horizontal" />
        <Accordion type="multiple">
          <AccordionItem value="accepted-bookings">
            <AccordionTrigger>Godkjente bookinger</AccordionTrigger>
            <AccordionContent className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
              {acceptedBookings.map((booking) => (
                <BookingItemCard
                  withImage={false}
                  className="w-full md:w-full!"
                  description={renderDescription(booking)}
                  buttonContent={
                    <div className="flex flex-row items-center gap-2.5">
                      <Button variant="outline">
                        <ArrowRightIcon /> Se detaljer
                      </Button>
                    </div>
                  }
                  key={booking.id}
                  item={booking.item!}
                  href={`/booking/status/${booking.reference}`}
                />
              ))}
              {acceptedBookings.length === 0 && (
                <span>Det er ingen godkjente bookinger</span>
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="completed-bookings">
            <AccordionTrigger>Gjennomførte bookinger</AccordionTrigger>
            <AccordionContent className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
              {completedBookings.map((booking) => (
                <BookingItemCard
                  withImage={false}
                  className="w-full md:w-full!"
                  description={renderDescription(booking)}
                  buttonContent={
                    <div className="flex flex-row items-center gap-2.5">
                      <Button variant="outline">
                        <ArrowRightIcon /> Se detaljer
                      </Button>
                    </div>
                  }
                  key={booking.id}
                  item={booking.item!}
                  href={`/booking/status/${booking.reference}`}
                />
              ))}
              {completedBookings.length === 0 && (
                <span>Det er ingen gjennomførte bookinger</span>
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="rejected-bookings">
            <AccordionTrigger>Avslåtte bookinger</AccordionTrigger>
            <AccordionContent className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
              {rejectedBookings.map((booking) => (
                <BookingItemCard
                  withImage={false}
                  className="w-full md:w-full!"
                  description={renderDescription(booking)}
                  buttonContent={
                    <div className="flex flex-row items-center gap-2.5">
                      <Button variant="outline">
                        <ArrowRightIcon /> Se detaljer
                      </Button>
                    </div>
                  }
                  key={booking.id}
                  item={booking.item!}
                  href={`/booking/status/${booking.reference}`}
                />
              ))}
              {rejectedBookings.length === 0 && (
                <span>Det er ingen avslåtte bookinger</span>
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="cancelled-bookings">
            <AccordionTrigger>Kansellerte bookinger</AccordionTrigger>
            <AccordionContent className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
              {cancelledBookings.map((booking) => (
                <BookingItemCard
                  withImage={false}
                  className="w-full md:w-full!"
                  description={renderDescription(booking)}
                  buttonContent={
                    <div className="flex flex-row items-center gap-2.5">
                      <Button variant="outline">
                        <ArrowRightIcon /> Se detaljer
                      </Button>
                    </div>
                  }
                  key={booking.id}
                  item={booking.item!}
                  href={`/booking/status/${booking.reference}`}
                />
              ))}
              {cancelledBookings.length === 0 && (
                <span>Det er ingen kansellerte bookinger</span>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default Booking;
