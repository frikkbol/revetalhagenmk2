import BookingContact from "@/components/ui/booking-contact";
import BookingPaymentToggle from "@/components/ui/booking-payment-toggle";
import BookingResultCard from "@/components/ui/booking-result-card";
import BookingReviewMeta from "@/components/ui/booking-review-meta";
import BookingStatusHero from "@/components/ui/booking-status-hero";
import BookingStatusProgress from "@/components/ui/booking-status-progress";
import BookingStatusToggle from "@/components/ui/booking-status-toggle";
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import type { PortableTextBlock } from "@portabletext/editor";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Bookingstatus",
  robots: {
    index: false,
    follow: false,
  },
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseRejectionReason(
  raw: string | null | undefined,
): PortableTextBlock[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PortableTextBlock[]) : [];
  } catch {
    return [];
  }
}

async function BookingStatus({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  if (!reference || !UUID_REGEX.test(reference)) {
    notFound();
  }

  let bookingData;
  try {
    bookingData = await api.booking.getBookingByReference({
      reference,
    });
  } catch {
    notFound();
  }

  if (!bookingData?.item) {
    notFound();
  }

  // const otherBookings = await api.booking.getOverlappingBookings({
  //   from: startOfWeek(bookingData?.from),
  //   to: endOfWeek(bookingData?.to),
  //   itemId: bookingData?.item?.id,
  // });

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAdmin = Boolean(session?.user.role?.includes("admin"));

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-5 pt-40 pb-10 md:px-10">
      <BookingStatusHero
        item={bookingData.item}
        from={bookingData.from}
        to={bookingData.to}
      />
      {!isAdmin && (
        <>
          {(bookingData.status === "rejected" ||
            bookingData.status === "confirmed") && (
            <BookingResultCard
              rejectionReason={bookingData.rejectionReason ?? "[]"}
              variant={bookingData.status}
              isPaid={bookingData.isPaid}
            />
          )}

          {bookingData.status !== "rejected" &&
            bookingData.status !== "cancelled" && (
              <>
                <BookingStatusProgress
                  status={bookingData.status}
                  isPaid={bookingData.isPaid}
                />
                <BookingContact className="mt-5" />
              </>
            )}
        </>
      )}

      {isAdmin && (
        <>
          <BookingReviewMeta
            booking={{
              ...bookingData,
              item: bookingData.item.id,
            }}
          />
          <BookingPaymentToggle
            bookingId={bookingData.id}
            isPaid={bookingData.isPaid}
            paidAt={bookingData.paidAt}
            hasEmail={Boolean(bookingData.email)}
          />
          {/* <BookingCalendarDialog
            bookings={[
              ...otherBookings.map((b) => ({
                ...b.booking,
                item: Number(b.item?.id),
              })),
              {
                ...bookingData,
                item: bookingData.item.id,
              },
            ]}
            trigger={
              <Button className="w-fit">
                <CalendarIcon />
                Se bookingkalender
              </Button>
            }
          /> */}
          <BookingStatusToggle
            bookingId={bookingData.id}
            initialValue={{
              status: bookingData.status,
              reason: parseRejectionReason(bookingData.rejectionReason),
            }}
          />
        </>
      )}
    </div>
  );
}

export default BookingStatus;
