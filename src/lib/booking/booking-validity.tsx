import { type db } from "@/server/db";
import { booking, item } from "@/server/db/schema";
import { and, eq, gt, gte, lt, lte, notInArray, or } from "drizzle-orm";

/**
 * THE FOLLOWING RULES APPLY TO BOOKING VALIDITY:
 * 1. If an item of type "arrangement" is booked for a day, any regular room reservations shall not overlap with the event.
 * 2. A room cannot be booked for less than one night (check that the dates are different)
 * 3. A room cannot be booked with the end date being before the starting date
 * 4. A room cannot be booked if it is already occupied during the requested dates
 * 5. A room cannot be booked if the requested dates are in the past
 * 6. A room cannot be booked if the requested dates are more than 1 year in the future
 * 7. A room cannot be booked in the past
 * 8. If other parts of the house is booked, the user shall be notified of this
 */

type DbClient = Pick<typeof db, "query" | "select">;

const INACTIVE_BOOKING_STATUSES = ["rejected", "cancelled"] as const;

const osloDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Oslo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const getOsloDateString = (date: Date): string =>
  osloDateFormatter.format(date);

const getEffectiveRange = (from: Date, to: Date) => {
  if (from.getTime() === to.getTime()) {
    const effectiveFrom = new Date(from);
    effectiveFrom.setHours(0, 0, 0, 0);
    const effectiveTo = new Date(to);
    effectiveTo.setHours(23, 59, 59, 999);
    return { effectiveFrom, effectiveTo };
  }
  return { effectiveFrom: from, effectiveTo: to };
};

const buildOverlapCondition = (from: Date, to: Date) => {
  const { effectiveFrom, effectiveTo } = getEffectiveRange(from, to);
  return or(
    and(lt(booking.from, effectiveTo), gt(booking.to, effectiveFrom)),
    and(
      eq(booking.from, booking.to),
      gte(booking.from, effectiveFrom),
      lte(booking.from, effectiveTo),
    ),
  );
};

type CheckBookingValidityProps = {
  db: DbClient;
  itemId: number;
  from: Date;
  to: Date;
};
export const CheckBookingValidity = async ({
  db,
  itemId,
  from,
  to,
}: CheckBookingValidityProps) => {
  if (
    !(from instanceof Date) ||
    !(to instanceof Date) ||
    Number.isNaN(from.getTime()) ||
    Number.isNaN(to.getTime())
  ) {
    return false;
  }

  if (from > to) {
    return false;
  }

  const now = new Date();
  const todayOslo = getOsloDateString(now);
  const fromOslo = getOsloDateString(from);
  const toOslo = getOsloDateString(to);

  if (fromOslo < todayOslo) {
    return false;
  }

  const oneYearFromNow = new Date(now);
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  if (to > oneYearFromNow) {
    return false;
  }

  // First check if an event is ongoing and overlapping with the times of the booking request
  const queriedItem = await db.query.item.findFirst({
    where: eq(item.id, itemId),
  });

  if (!queriedItem) {
    throw new Error("Item not found");
  }

  // For ItemType.OVERNATTING (type 1), require at least 1 night
  if (queriedItem.type === 1 && (fromOslo >= toOslo || from >= to)) {
    return false;
  }

  const overlapCondition = buildOverlapCondition(from, to);

  // Check if the item is of type "arrangement" (type 2)
  if (queriedItem.type === 2) {
    // Check if there are ANY active bookings at all in the entire house within the selected date range
    const overlappingBookings = await db
      .select({ id: booking.id })
      .from(booking)
      .where(
        and(
          notInArray(booking.status, [...INACTIVE_BOOKING_STATUSES]),
          overlapCondition,
        ),
      );

    return overlappingBookings.length === 0;
  }

  // If item is not of type "arrangement", check if this item or any arrangement overlaps with the booking
  const bookings = await db
    .select({ id: booking.id })
    .from(booking)
    .leftJoin(item, eq(booking.item, item.id))
    .where(
      and(
        notInArray(booking.status, [...INACTIVE_BOOKING_STATUSES]),
        or(eq(booking.item, itemId), eq(item.type, 2)),
        overlapCondition,
      ),
    );

  return bookings.length === 0;
};

type GetItemBookingsProps = {
  db: DbClient;
  itemId: number;
  from: Date;
  to: Date;
};
export const GetItemBookings = async ({
  db,
  itemId,
  from,
  to,
}: GetItemBookingsProps) => {
  // First check if an event is ongoing and overlapping with the times of the booking request
  const queriedItem = await db.query.item.findFirst({
    where: eq(item.id, itemId),
  });

  if (!queriedItem) {
    throw new Error("Item not found");
  }

  const overlapCondition = buildOverlapCondition(from, to);

  const safeSelection = {
    booking: {
      id: booking.id,
      from: booking.from,
      to: booking.to,
      status: booking.status,
    },
    item: {
      id: item.id,
      type: item.type,
    },
  };

  // Check if the item is of type "arrangement" (type 2)
  if (queriedItem.type === 2) {
    // Check if there are ANY active bookings at all in the entire house within the selected date range
    const overlappingBookings = await db
      .select(safeSelection)
      .from(booking)
      .leftJoin(item, eq(booking.item, item.id))
      .where(
        and(
          notInArray(booking.status, [...INACTIVE_BOOKING_STATUSES]),
          overlapCondition,
        ),
      );

    return overlappingBookings;
  }

  // If item is not of type "arrangement", check if this item or any arrangement overlaps with the booking
  const bookings = await db
    .select(safeSelection)
    .from(booking)
    .leftJoin(item, eq(booking.item, item.id))
    .where(
      and(
        notInArray(booking.status, [...INACTIVE_BOOKING_STATUSES]),
        or(eq(booking.item, itemId), eq(item.type, 2)),
        overlapCondition,
      ),
    );

  return bookings;
};
