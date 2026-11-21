import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { AlertTriangle, CheckIcon, MailIcon } from "lucide-react";
import { Separator } from "./separator";
import PortableRenderer from "./portable-text/render-components/PortableRenderer";
import type { PortableTextBlock } from "@portabletext/editor";
import Link from "next/link";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type BookingResultCardProps = {
  rejectionReason?: string;
  variant?: "confirmed" | "rejected";
  isPaid?: boolean;
};

function parseRejectionReason(
  reason?: string,
): PortableTextBlock[] | string | null {
  if (!reason?.trim()) return null;
  try {
    const parsed: unknown = JSON.parse(reason);
    if (Array.isArray(parsed)) {
      return parsed as PortableTextBlock[];
    }
    return reason;
  } catch {
    return reason;
  }
}

function BookingResultCard({
  rejectionReason,
  variant = "confirmed",
  isPaid = false,
}: BookingResultCardProps) {
  const parsedRejectionReason =
    variant === "rejected" ? parseRejectionReason(rejectionReason) : null;

  return (
    <Card className="my-10">
      <CardHeader>
        <CardTitle
          className={cn(
            "flex items-center gap-2.5",
            variant === "confirmed" ? "text-primary" : "text-amber-600",
          )}
        >
          {variant === "rejected" && (
            <>
              <AlertTriangle /> Avslag på søknad
            </>
          )}
          {variant === "confirmed" && (
            <>
              <CheckIcon />{" "}
              {isPaid ? "Bookingen er godkjent og betalt" : "Søknaden er godkjent"}
            </>
          )}
        </CardTitle>
        <CardDescription>
          {variant === "rejected"
            ? "Søknaden din ble avslått. Begrunnelse for dette er oppgitt nedenfor."
            : isPaid
              ? "Betalingen din er registrert, og alt er klart for oppholdet ditt."
              : "Søknaden din er godkjent. Du vil motta en epost med mer informasjon."}
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="mt-0 flex flex-col gap-5">
        {parsedRejectionReason &&
          (Array.isArray(parsedRejectionReason) ? (
            <PortableRenderer value={parsedRejectionReason} />
          ) : (
            <p className="whitespace-pre-wrap">{parsedRejectionReason}</p>
          ))}
        <div className="flex flex-col gap-2.5">
          {variant === "confirmed" && (
            <>
              <span>
                Vi har nå bekreftet at huset er tilgjengelig, og med det ønsker
                vi deg velkommen!
              </span>
              {isPaid ? (
                <span>
                  Betalingen er registrert, og alt er klart for oppholdet ditt.
                  Hvis du lurer på noe i mellomtiden, er det bare å ta kontakt.
                </span>
              ) : (
                <span>
                  Du vil snart motta en mail med betalingsinstrukser, og annen
                  relevant informasjon rundt bookingen din. Hvis du lurer på noe
                  i mellomtiden, er det bare å ta kontakt.
                </span>
              )}
            </>
          )}
          <Link href="mailto:post@revetalhagen.no" className="w-fit">
            <Button>
              <MailIcon /> Ta kontakt
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default BookingResultCard;
