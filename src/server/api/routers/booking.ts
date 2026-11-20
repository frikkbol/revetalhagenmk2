import {
  CheckBookingValidity,
  GetItemBookings,
} from "@/lib/booking/booking-validity";
import { CalculatePrice } from "@/lib/booking/price";
import { booking, BookingStates, item, itemMeta } from "@/server/db/schema";
import sendBookingConfirmations, {
  sendBookingConfirmationsToAdmin,
  sendBookingStatusUpdate,
} from "@/server/email/booking";
import { TRPCError } from "@trpc/server";
import { eq, notInArray, sql } from "drizzle-orm";
import { z } from "zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

const hasNonEmptyReason = (reason?: string): boolean => {
  if (!reason) return false;
  const trimmed = reason.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.some((block) => {
          if (
            typeof block === "object" &&
            block !== null &&
            "children" in block &&
            Array.isArray((block as { children: unknown }).children)
          ) {
            return (block as { children: unknown[] }).children.some(
              (child) =>
                typeof child === "object" &&
                child !== null &&
                "text" in child &&
                typeof (child as { text: unknown }).text === "string" &&
                (child as { text: string }).text.trim().length > 0,
            );
          }
          return false;
        });
      }
    } catch {
      // Not valid JSON, treat as plain text
    }
  }

  return true;
};

export const bookingRouter = createTRPCRouter({
  getItemTypes: publicProcedure.query(async ({ ctx }) => {
    const itemTypes = await ctx.db.query.itemType.findMany();
    return itemTypes;
  }),
  getItems: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        type: z.number().optional(),
        from: z.date().optional(),
        to: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { query, type, from, to } = input;

      const items = await ctx.db.query.item.findMany({
        where: (item, { eq, ilike, and, notExists, lt, gt }) => {
          const conditions = [];
          if (query) {
            // name ILIKE '%query%'
            conditions.push(ilike(item.name, `%${query}%`));
          }
          if (type !== undefined) {
            // exact match on item.type
            conditions.push(eq(item.type, type));
          }
          if (from && to) {
            // exclude any item that has *any* active booking overlapping [from, to)
            conditions.push(
              notExists(
                ctx.db
                  .select({
                    id: booking.id,
                  })
                  .from(booking)
                  .where(
                    and(
                      eq(booking.item, item.id),
                      notInArray(booking.status, ["rejected", "cancelled"]),
                      lt(booking.from, to), // booking.from < requestedTo
                      gt(booking.to, from), // booking.to   > requestedFrom
                    ),
                  ),
              ),
            );
          }
          return and(...conditions);
        },
      });

      return items;
    }),
  getItemById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.query.item.findFirst({
        where: (item, { eq }) => eq(item.id, input.id),
        with: {
          itemMeta: true,
          itemImage: true,
        },
      });
      return item;
    }),
  updateItem: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(256).optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        type: z.number().optional(),
        price: z.number().optional(),
        memberDiscount: z.number().optional(),
        personPrice: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, description, image, type, price } = input;
      const updatedItem = await ctx.db
        .update(item)
        .set({
          name: name ?? undefined,
          description: description ?? undefined,
          image: image ?? undefined,
          type: type ?? undefined,
          price: price ?? undefined,
          memberDiscount: input.memberDiscount ?? undefined,
          personPrice: input.personPrice ?? undefined,
        })
        .where(eq(item.id, id))
        .returning();

      return updatedItem[0];
    }),
  addItemMeta: adminProcedure
    .input(
      z.object({
        icon: z.string().optional(),
        label: z.string().min(1).max(256),
        itemId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { icon, label, itemId } = input;
      const meta = await ctx.db
        .insert(itemMeta)
        .values({
          icon: icon ?? null,
          label,
          item: itemId,
        })
        .returning();

      return meta[0];
    }),

  deleteItemMeta: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const deletedMeta = await ctx.db
        .delete(itemMeta)
        .where(eq(itemMeta.id, id))
        .returning();
      return deletedMeta[0];
    }),

  createBooking: publicProcedure
    .input(
      z
        .object({
          itemId: z.number(),
          from: z.date(),
          to: z.date(),
          userId: z.number().optional(),
          email: z.string().email().optional().or(z.literal("")),
          phone: z.string().optional(),
          name: z.string().trim().min(2),
          message: z.string().optional(),
          personCount: z.number().min(1).max(100).optional(),
        })
        .refine((data) => data.from <= data.to, {
          message: "Fra-dato må være før eller lik til-dato",
          path: ["from"],
        })
        .refine((data) => !!data.email || !!data.phone, {
          message: "Du må fylle ut enten epost eller telefonnummer",
          path: ["email"],
        }),
    )
    .mutation(async ({ ctx, input }) => {
      const { itemId, from, to, email, phone, name, message, personCount } =
        input;

      const { createdBooking, bookedItem, price } = await ctx.db.transaction(
        async (tx) => {
          await tx.execute(sql`SELECT pg_advisory_xact_lock(987654321)`);

          // Check booking validity inside transaction
          const isValid = await CheckBookingValidity({
            db: tx,
            itemId,
            from,
            to,
          });

          if (!isValid) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Gjenstanden er ikke tilgjengelig i det valgte tidsrommet.",
            });
          }

          const bookedItem = await tx.query.item.findFirst({
            where: eq(item.id, itemId),
          });

          const price = await CalculatePrice({
            db: tx,
            itemId,
            from,
            to,
            people: personCount,
          });

          const created = await tx
            .insert(booking)
            .values({
              item: itemId,
              from,
              to,
              name,
              email: email?.trim() ? email.trim() : null,
              personCount: bookedItem?.type === 1 ? personCount : null,
              phone: phone?.trim() ? phone.trim() : null,
              message,
              price: price.nonMemberPrice,
            })
            .returning();

          return {
            createdBooking: created[0],
            bookedItem,
            price,
          };
        },
      );

      // Send the booking confirmation email to admin
      try {
        await sendBookingConfirmationsToAdmin({
          from,
          to,
          bookingReference: createdBooking?.reference,
          item: {
            name: bookedItem?.name ?? "Ukjent gjenstand",
          },
          name,
          totalPrice: price.nonMemberPrice,
        });
      } catch (error) {
        console.error(
          "Failed to send admin booking confirmation email:",
          error,
        );
      }

      if (email) {
        // Send booking confirmation email
        try {
          await sendBookingConfirmations({
            email,
            from,
            to,
            bookingReference: createdBooking?.reference,
            item: {
              name: bookedItem?.name ?? "Ukjent gjenstand",
            },
            name,
            totalPrice: price.nonMemberPrice,
          });
        } catch (error) {
          console.error("Failed to send booking confirmation email:", error);
        }
      }

      return createdBooking;
    }),
  checkAvailability: publicProcedure
    .input(
      z.object({
        itemId: z.number(),
        from: z.date(),
        to: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const validity = await CheckBookingValidity({
        db: ctx.db,
        ...input,
      });

      return validity;
    }),
  getBookings: adminProcedure
    .input(
      z.object({
        itemId: z.number().optional(),
        to: z.date().optional(),
        from: z.date().optional(),
        status: z.enum(BookingStates).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { itemId, from, to, status } = input;

      const bookings = await ctx.db.query.booking.findMany({
        columns: {
          item: false,
        },
        where: (booking, { eq, gte, lte, and }) => {
          const conditions = [];

          if (itemId) {
            conditions.push(eq(booking.item, itemId));
          }
          if (from) {
            conditions.push(gte(booking.from, from));
          }
          if (to) {
            conditions.push(lte(booking.to, to));
          }
          if (status) {
            conditions.push(eq(booking.status, status));
          }
          return and(...conditions);
        },
        orderBy: (booking, { desc }) => [desc(booking.createdAt)],
        with: {
          item: true,
        },
      });

      return bookings;
    }),
  getItemBookings: publicProcedure
    .input(
      z.object({
        itemId: z.number(),
        from: z.date().optional(),
        to: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { itemId, from, to } = input;
      const now = new Date();

      const bookings = await GetItemBookings({
        db: ctx.db,
        itemId,
        from: from ?? now,
        to: to ?? new Date(now.getTime() + 24 * 60 * 60 * 1000 * 60), // Default to 60 days later
      });

      return bookings;
    }),
  getBookingByReference: publicProcedure
    .input(
      z.object({
        reference: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { reference } = input;

      const response = await ctx.db.query.booking.findFirst({
        where: eq(booking.reference, reference),
        columns: {
          item: false,
        },
        with: {
          item: true,
        },
      });

      return response;
    }),
  getOverlappingBookings: adminProcedure
    .input(
      z.object({
        itemId: z.number(),
        from: z.date(),
        to: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { itemId, from, to } = input;

      const bookings = await GetItemBookings({
        db: ctx.db,
        itemId,
        from,
        to,
      });

      return bookings;
    }),
  updateBookingStatus: adminProcedure
    .input(
      z
        .object({
          status: z.enum(BookingStates),
          bookingId: z.number(),
          reason: z.string().optional(),
        })
        .refine(
          (data) => {
            if (data.status === "rejected") {
              return hasNonEmptyReason(data.reason);
            }
            return true;
          },
          {
            path: ["reason"],
            message:
              "Begrunnelse må være definert dersom forespørselen skal avslås",
          },
        ),
    )
    .mutation(async ({ ctx, input }) => {
      const { status, reason, bookingId } = input;

      // Update the booking status in the database
      const updated = await ctx.db
        .update(booking)
        .set({ status, rejectionReason: reason })
        .where(eq(booking.id, bookingId))
        .returning();

      // Send booking status update email to user
      const updatedBooking = updated[0];
      if (!updatedBooking) return undefined;

      if (updatedBooking.email) {
        try {
          await sendBookingStatusUpdate({
            name: updatedBooking.name ?? "",
            to: updatedBooking.email,
            bookingReference: updatedBooking.reference,
          });
        } catch (error) {
          console.error("Failed to send booking status update email:", error);
        }
      }

      return updatedBooking;
    }),
});
