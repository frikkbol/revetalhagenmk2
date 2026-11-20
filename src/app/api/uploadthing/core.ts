import { auth } from "@/server/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const requireAdmin = async (req: Request) => {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new UploadThingError("Ikke innlogget");
  }

  if (!session.user.role?.includes("admin")) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new UploadThingError("Kun administratorer kan laste opp bilder");
  }

  return { userId: session.user.id };
};

export const ourFileRouter = {
  coverImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => requireAdmin(req))
    .onUploadComplete(async ({ file }) => {
      return {
        url: file.ufsUrl,
        key: file.key,
        name: file.name,
      };
    }),

  inlineImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => requireAdmin(req))
    .onUploadComplete(async ({ file }) => {
      return {
        url: file.ufsUrl,
        key: file.key,
        name: file.name,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
