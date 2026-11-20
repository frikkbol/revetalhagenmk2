import { z } from "zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { pageContent } from "@/server/db/schema";
import { deleteRemovedImages } from "@/server/uploadthing";
import { eq } from "drizzle-orm";

export const cmsRouter = createTRPCRouter({
  getContent: publicProcedure
    .input(
      z.object({
        slug: z.string(),
        id: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const content = await ctx.db.query.pageContent.findMany({
        where: (pageContent, { eq, and }) =>
          input.id !== undefined
            ? and(
                eq(pageContent.slug, input.slug),
                eq(pageContent.id, input.id),
              )
            : eq(pageContent.slug, input.slug),
      });

      return content;
    }),

  createContent: adminProcedure
    .input(
      z.object({
        slug: z.string(),
        order: z.number().optional(),
        content: z.object({
          title: z.string(),
          image: z.string().optional(),
          content: z.string(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const nextImage =
        input.content.image && input.content.image.length > 0
          ? input.content.image
          : undefined;

      const created = await ctx.db.insert(pageContent).values({
        slug: input.slug,
        order: input.order,
        content: {
          ...input.content,
          image: nextImage,
        },
      });

      return created;
    }),

  updateContent: adminProcedure
    .input(
      z.object({
        id: z.number(),
        slug: z.string(),
        order: z.number().optional(),
        content: z.object({
          title: z.string(),
          image: z.string().optional(),
          content: z.string(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.pageContent.findFirst({
        where: eq(pageContent.id, input.id),
      });

      const nextImage =
        input.content.image && input.content.image.length > 0
          ? input.content.image
          : undefined;

      const updated = await ctx.db
        .update(pageContent)
        .set({
          slug: input.slug,
          order: input.order,
          content: {
            ...input.content,
            image: nextImage,
          },
        })
        .where(eq(pageContent.id, input.id));

      if (existing) {
        await deleteRemovedImages({
          previousImage: existing.content.image,
          nextImage: nextImage ?? null,
        });
      }

      return updated;
    }),

  deleteContent: adminProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const deleted = await ctx.db
        .delete(pageContent)
        .where(eq(pageContent.id, input.id))
        .returning();

      if (deleted[0]) {
        await deleteRemovedImages({
          previousImage: deleted[0].content.image,
        });
      }

      return deleted;
    }),
});
