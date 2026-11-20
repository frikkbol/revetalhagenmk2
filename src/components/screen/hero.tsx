"use client";

import { cn } from "@/lib/utils";
import { authClient } from "@/server/auth/client";
import { api } from "@/trpc/react";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  ExternalLink,
  ImagePlusIcon,
  Loader2Icon,
  SaveIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import EditableParagraph from "../editable-paragraph";
import HeroImage from "../hero-image";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ImageUpload } from "../ui/image-upload";

const DEFAULT_HERO_IMAGE = "/images/laahnehuset.jpg";

function Hero({ className, ...props }: React.HTMLProps<HTMLDivElement>) {
  const { data: session } = authClient.useSession();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const isAdmin = mounted && (session?.user?.role?.includes("admin") ?? false);

  const { data: paragraph, isLoading: paragraphLoading } =
    api.cms.getContent.useQuery({
      slug: "hero-description",
    });
  const trpcUtils = api.useUtils();

  const [editImageOpen, setEditImageOpen] = useState(false);
  const [draftImage, setDraftImage] = useState("");

  const heroContent = paragraph?.[0];
  const customHeroImage =
    heroContent?.content.image && heroContent.content.image.length > 0
      ? heroContent.content.image
      : undefined;
  const heroImageSrc = customHeroImage ?? DEFAULT_HERO_IMAGE;

  const { mutateAsync: updateContent, isPending: isUpdating } =
    api.cms.updateContent.useMutation({
      onSuccess: () => {
        void trpcUtils.cms.getContent.invalidate({
          slug: "hero-description",
        });
      },
    });

  const { mutateAsync: createContent, isPending: isCreating } =
    api.cms.createContent.useMutation({
      onSuccess: () => {
        void trpcUtils.cms.getContent.invalidate({
          slug: "hero-description",
        });
      },
    });

  const isSaving = isUpdating || isCreating;

  const handleOpenImageDialog = () => {
    setDraftImage(customHeroImage ?? "");
    setEditImageOpen(true);
  };

  const handleSaveDescription = async (content: string) => {
    try {
      if (heroContent?.id) {
        await updateContent({
          id: heroContent.id,
          content: {
            content,
            title: heroContent.content.title ?? "",
            image: customHeroImage,
          },
          slug: "hero-description",
        });
      } else {
        await createContent({
          slug: "hero-description",
          content: {
            content,
            title: "",
            image: customHeroImage,
          },
        });
      }
      toast.success("Innholdet ble oppdatert");
    } catch {
      toast.error("Kunne ikke oppdatere innholdet");
    }
  };

  const handleSaveImage = async () => {
    const trimmed = draftImage.trim();
    const nextImage = trimmed.length > 0 ? trimmed : undefined;
    try {
      if (heroContent?.id) {
        await updateContent({
          id: heroContent.id,
          slug: "hero-description",
          content: {
            title: heroContent.content.title ?? "",
            content: heroContent.content.content ?? "",
            image: nextImage,
          },
        });
      } else {
        await createContent({
          slug: "hero-description",
          content: {
            title: "",
            content: "",
            image: nextImage,
          },
        });
      }
      setEditImageOpen(false);
      toast.success("Forsidebilde oppdatert");
    } catch {
      toast.error("Kunne ikke oppdatere forsidebilde");
    }
  };

  return (
    <div className="relative flex w-full items-center pt-24 pb-10 md:min-h-[92vh] md:pt-28 md:pb-28">
      <div
        className={cn(
          "mx-auto flex w-full flex-col gap-5 md:grid md:grid-cols-[auto_1fr] md:grid-rows-[auto_auto] md:items-stretch md:gap-x-6 md:gap-y-8",
          className,
        )}
        {...props}
      >
        <motion.div
          className="col-start-2 row-start-1 mx-auto block w-fit md:mx-0"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.1,
            type: "spring",
            damping: 22,
            stiffness: 180,
          }}
        >
          <h1 className="text-foreground text-center text-[2rem] leading-[1.15] font-semibold tracking-tight sm:text-5xl md:text-left lg:text-6xl">
            Velkommen til{" "}
            <motion.span
              className="bg-secondary text-secondary-foreground mt-1.5 inline-flex items-center overflow-hidden rounded-2xl px-3.5 py-0.5 shadow-xs ring-1 ring-black/5 sm:px-4 sm:py-1 md:mt-0 md:rounded-3xl md:px-5"
              initial={{
                opacity: 0,
                x: -24,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.25,
                duration: 0.4,
              }}
            >
              <motion.span
                className="block"
                initial={{
                  opacity: 0,
                  y: 24,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.35,
                  type: "spring",
                  damping: 20,
                  stiffness: 180,
                }}
              >
                Revetalhagen
              </motion.span>
            </motion.span>
          </h1>
        </motion.div>
        <HeroImage
          src={heroImageSrc}
          imageOverlay={
            isAdmin ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleOpenImageDialog}
                className="bg-background/85 text-foreground hover:bg-background absolute top-3 right-3 z-10 rounded-full shadow-md backdrop-blur-md md:top-4 md:right-4"
              >
                <ImagePlusIcon className="size-4" />
                Endre bilde
              </Button>
            ) : undefined
          }
          cardContent={
            <>
              <EditableParagraph
                className="text-foreground/90 line-clamp-5 w-full text-sm leading-relaxed md:line-clamp-[7] md:text-base"
                content={heroContent?.content.content}
                admin={isAdmin}
                onChange={(content) => {
                  void handleSaveDescription(content);
                }}
              />
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <Link href="/om-oss" className="w-fit">
                  <Button className="group w-fit rounded-full px-5">
                    Les mer{" "}
                    <ArrowRightIcon className="transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link
                  href="/bli-medlem"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/85 inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium shadow-xs ring-1 ring-black/5 transition-colors md:hidden"
                >
                  <Image
                    className="h-5 w-5 object-contain"
                    src="/images/nakuhel-logo.webp"
                    alt="Nakuhel logo"
                    height={40}
                    width={40}
                  />
                  <span>Bli medlem</span>
                  <ExternalLink size={14} />
                </Link>
              </div>
            </>
          }
          cardContentLoading={paragraphLoading}
        />

        <Link
          href="/bli-medlem"
          className="group border-secondary-foreground/15 bg-secondary/85 text-secondary-foreground hover:bg-secondary col-start-1 row-start-2 hidden w-44 flex-col items-center justify-center gap-5 rounded-[2rem] border px-5 py-8 shadow-lg shadow-black/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl md:flex"
        >
          <div className="flex flex-row items-center gap-2 text-base font-medium text-nowrap">
            <span>Bli medlem</span>
            <ExternalLink
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>

          <Image
            className="aspect-square w-14 object-contain transition-transform duration-300 group-hover:scale-105"
            src="/images/nakuhel-logo.webp"
            alt="Nakuhel logo"
            height={500}
            width={500}
          />
        </Link>
      </div>

      {isAdmin && (
        <Dialog open={editImageOpen} onOpenChange={setEditImageOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Endre forsidebilde</DialogTitle>
              <DialogDescription>
                Last opp et nytt bilde til forsiden. Fjerner du bildet, brukes
                standardbildet.
              </DialogDescription>
            </DialogHeader>
            <ImageUpload value={draftImage} onChange={setDraftImage} />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => setEditImageOpen(false)}
              >
                Avbryt
              </Button>
              <Button
                type="button"
                disabled={isSaving}
                onClick={() => void handleSaveImage()}
              >
                {isSaving ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <SaveIcon />
                )}
                Lagre
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default Hero;
