"use client";

import { cn } from "@/lib/utils";
import { authClient } from "@/server/auth/client";
import { api } from "@/trpc/react";
import { motion } from "framer-motion";
import { ArrowRightIcon, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import EditableParagraph from "../editable-paragraph";
import HeroImage from "../hero-image";
import { Button } from "../ui/button";

function Hero({ className, ...props }: React.HTMLProps<HTMLDivElement>) {
  const { data: session } = authClient.useSession();
  const { data: paragraph, isLoading: paragraphLoading } =
    api.cms.getContent.useQuery({
      slug: "hero-description",
    });
  const trpcUtils = api.useUtils();
  const { mutate } = api.cms.updateContent.useMutation({
    onSuccess: () => {
      void trpcUtils.cms.getContent.invalidate({
        slug: "hero-description",
      });
    },
  });

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
          src="/images/laahnehuset.jpg"
          cardContent={
            <>
              <EditableParagraph
                className="text-foreground/90 line-clamp-5 w-full text-sm leading-relaxed md:line-clamp-[7] md:text-base"
                content={paragraph?.[0]?.content.content}
                admin={session?.user?.role === "admin"}
                onChange={(content) => {
                  if (!paragraph?.[0]?.id) return;
                  mutate({
                    id: paragraph?.[0]?.id,
                    content: {
                      content,
                      title: "",
                    },
                    slug: "hero-description",
                  });
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
    </div>
  );
}

export default Hero;
