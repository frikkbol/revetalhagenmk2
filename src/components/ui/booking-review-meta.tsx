import React from "react";
import { Badge } from "./badge";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import type { booking } from "@/server/db/schema";
import { format } from "date-fns";
import {
  BanknoteIcon,
  CheckCircle2,
  CircleX,
  ClockIcon,
  Mail,
  MessageSquareIcon,
  Phone,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import { nb } from "date-fns/locale";

type BookingReviewMetaProps = {
  booking: typeof booking.$inferSelect;
};

function BookingReviewMeta({ booking }: BookingReviewMetaProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookingoversikt</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        <span className="flex items-center gap-2.5">
          <ClockIcon />
          <span>
            Fra <strong>{format(booking.from, "PPPP", { locale: nb })}</strong>{" "}
            til <strong>{format(booking.to, "PPPP", { locale: nb })}</strong>
          </span>
        </span>
        <span className="flex flex-wrap items-center gap-2.5">
          <BanknoteIcon />
          <span>
            <strong>{booking.price} kr</strong>
          </span>
          {booking.isPaid ? (
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
              <CheckCircle2 className="size-3.5" />
              Betalt
              {booking.paidAt &&
                ` (${format(booking.paidAt, "dd.MM.yyyy", { locale: nb })})`}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              <CircleX className="size-3.5" />
              Ikke betalt
            </Badge>
          )}
        </span>
        {booking.personCount != null && (
          <span className="flex items-center gap-2.5">
            <UsersIcon />
            <span>
              {booking.personCount}{" "}
              {booking.personCount === 1 ? "person" : "personer"}
            </span>
          </span>
        )}
        <span className="flex items-center gap-2.5">
          <UserIcon />
          {booking.name}
        </span>
        <span className="flex items-center gap-2.5">
          <Mail />
          {booking.email}
        </span>
        {booking.phone && (
          <span className="flex items-center gap-2.5">
            <Phone />
            {booking.phone}
          </span>
        )}
        {booking.message && booking.message.trim().length > 0 && (
          <span className="flex items-start gap-2.5">
            <MessageSquareIcon className="mt-0.5 shrink-0" />
            <span className="whitespace-pre-wrap">{booking.message}</span>
          </span>
        )}
      </CardContent>
    </Card>
  );
}

export default BookingReviewMeta;
