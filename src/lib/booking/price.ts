// Calculate the price of a booking based on the item type (and the price stored in the database) and duration

import type { db } from "@/server/db";

const osloDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Oslo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const toOsloUtcMidnightMs = (date: Date): number => {
  const [year = 0, month = 1, day = 1] = osloDateFormatter
    .format(date)
    .split("-")
    .map(Number);
  return Date.UTC(year, month - 1, day);
};

type CalculatePriceProps = {
  db: Pick<typeof db, "query">;
  itemId: number;
  from: Date;
  to: Date;
  people?: number;
};

export const CalculatePrice = async ({
  db,
  from,
  to,
  itemId,
  people,
}: CalculatePriceProps) => {
  // Get the item pricing from the database
  const item = await db.query.item.findFirst({
    where: (item, { eq }) => eq(item.id, itemId),
  });

  if (!item) {
    throw new Error("Item not found");
  }

  const dayDifference = Math.round(
    (toOsloUtcMidnightMs(to) - toOsloUtcMidnightMs(from)) / MS_PER_DAY,
  );
  const days =
    item.type === 2 || item.type === 4
      ? Math.max(1, dayDifference + 1)
      : Math.max(1, dayDifference);

  const price =
    item.type === 1
      ? ((people ?? 0) * item.personPrice + item.price) * days
      : item.type === 3
        ? item.price
        : item.price * days;

  return {
    nonMemberPrice: price,
    memberPrice: Math.round((price * (100 - (item.memberDiscount ?? 0))) / 100),
  };
};
