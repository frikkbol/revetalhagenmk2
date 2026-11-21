"use client";

import { api } from "@/trpc/react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { CheckCircle2, CircleX, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";

type BookingPaymentToggleProps = {
  bookingId: number;
  isPaid: boolean;
  paidAt: Date | null;
  hasEmail: boolean;
};

function BookingPaymentToggle({
  bookingId,
  isPaid,
  paidAt,
  hasEmail,
}: BookingPaymentToggleProps) {
  const router = useRouter();
  const { mutateAsync, isPending } =
    api.booking.updateBookingPaymentStatus.useMutation();

  const handleToggle = () => {
    const nextIsPaid = !isPaid;
    void mutateAsync({
      bookingId,
      isPaid: nextIsPaid,
    })
      .then(() => {
        toast.success(
          nextIsPaid
            ? "Bookingen ble markert som betalt"
            : "Betalt-markering ble fjernet",
        );
        router.refresh();
      })
      .catch(() => {
        toast.error("Kunne ikke oppdatere betalingsstatus");
      });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Betalingsstatus</CardTitle>
          {isPaid ? (
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
              <CheckCircle2 className="size-3.5" />
              Betalt
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              <CircleX className="size-3.5" />
              Ikke betalt
            </Badge>
          )}
        </div>
        <CardDescription>
          {isPaid
            ? paidAt
              ? `Registrert som betalt ${format(paidAt, "PPPP 'kl.' HH:mm", { locale: nb })}.`
              : "Bookingen er registrert som betalt."
            : hasEmail
              ? "Marker bookingen som betalt når betalingen er mottatt. Det vil umiddelbart bli sendt ut en betalingsbekreftelse på epost til kunden."
              : "Marker bookingen som betalt når betalingen er mottatt."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          variant={isPaid ? "outline" : "default"}
          disabled={isPending}
          onClick={handleToggle}
        >
          {isPending ? (
            <Loader className="animate-spin" />
          ) : isPaid ? (
            <>
              <CircleX /> Marker som ikke betalt
            </>
          ) : (
            <>
              <CheckCircle2 /> Marker som betalt
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default BookingPaymentToggle;
