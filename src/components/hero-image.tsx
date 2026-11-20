"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Loader } from "lucide-react";
import Image from "next/image";
import React from "react";
import SlideAnimation from "./ui/animated/slide-animation";
import { Card, CardContent } from "./ui/card";

type HeroImageProps = {
  cardContent?: React.ReactNode;
  cardContentLoading?: boolean;
  src: string;
};
const HeroImage = ({
  cardContent,
  cardContentLoading,
  src,
}: HeroImageProps) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 50,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        type: "spring",
        duration: 0.5,
        damping: 20,
      }}
      className="bg-card/95 border-border/70 shadow-primary/10 relative col-start-2 row-start-2 flex w-full flex-col overflow-hidden rounded-3xl border shadow-xl backdrop-blur-md md:overflow-visible md:rounded-none md:border-0 md:bg-transparent md:shadow-none md:backdrop-blur-none"
    >
      <Image
        className="mx-auto h-56 w-full object-cover sm:h-72 md:mx-0 md:h-[27rem] md:rounded-[2.25rem] md:shadow-2xl md:shadow-black/15 md:ring-1 md:ring-black/10"
        src={src}
        alt="Lånehuset"
        height={2000}
        width={2000}
        priority
      />
      <AnimatePresence>
        <SlideAnimation
          direction="up"
          className="md:absolute md:bottom-0 md:left-10 md:translate-y-1/2"
        >
          <Card className="md:bg-card/95 md:border-border/70 md:shadow-primary/10 w-full gap-0 rounded-none border-0 bg-transparent py-5 shadow-none md:w-fit md:max-w-lg md:rounded-3xl md:border md:shadow-xl md:backdrop-blur-md">
            <CardContent className="flex w-full flex-col gap-4 px-5 sm:px-6">
              {cardContentLoading && (
                <Loader className="mx-auto animate-spin" />
              )}
              {cardContent}
            </CardContent>
          </Card>
        </SlideAnimation>
      </AnimatePresence>
    </motion.div>
  );
};

export default HeroImage;
