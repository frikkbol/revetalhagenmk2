import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs";
import SlideAnimation from "@/components/ui/animated/slide-animation";
import EventContextMenu from "@/components/ui/event-context-menu";
import PortableRenderer from "@/components/ui/portable-text/render-components/PortableRenderer";
import { formatEventDateRange } from "@/lib/event-date-format";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { api } from "@/trpc/server";
import type { PortableTextBlock } from "@portabletext/react";
import { HomeIcon } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";

import "quill/dist/quill.snow.css";

type EventPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return {
      title: "Arrangement ikke funnet",
      robots: { index: false, follow: false },
    };
  }

  const ev = await db.query.event.findFirst({
    where: (event, { eq }) => eq(event.id, numericId),
    columns: {
      title: true,
      preview: true,
      image: true,
    },
  });

  if (!ev) {
    return {
      title: "Arrangement ikke funnet",
      robots: { index: false, follow: false },
    };
  }

  const title = ev.title ?? "Arrangement";
  const trimmedPreview = ev.preview?.trim() ?? "";
  const description =
    trimmedPreview.length > 0
      ? trimmedPreview
      : "Se detaljer om dette arrangementet i Revetalhagen.";

  return {
    title,
    description,
    alternates: {
      canonical: `/arrangementer/${numericId}`,
    },
    openGraph: {
      title,
      description,
      ...(ev.image ? { images: [{ url: ev.image, alt: title }] } : {}),
    },
  };
}

async function Page({ params }: EventPageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  const data = await api.events.getById({ id: numericId });
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!data) {
    notFound();
  }

  return (
    <SlideAnimation
      className="mx-auto flex max-w-6xl flex-col gap-5 px-5 pt-24 pb-10 md:px-10 md:pt-32"
      direction="up"
      transition={{
        delay: 0.2,
        duration: 1,
        type: "spring",
        damping: 10,
      }}
    >
      <DynamicBreadcrumbs
        items={[
          {
            href: "/",
            label: "Hjem",
            icon: <HomeIcon size={16} />,
          },
          {
            href: "/arrangementer",
            label: "Arrangementer",
          },
          {
            href: `/arrangementer/${id}`,
            label: data?.event.title ?? "Arrangement",
          },
        ]}
      />
      <SlideAnimation
        direction="up"
        className="flex flex-row items-center gap-5"
        transition={{
          delay: 0.6,
          duration: 0.3,
        }}
      >
        <h1 className="text-foreground flex w-fit flex-row gap-5 text-4xl leading-12 md:text-6xl md:leading-20">
          {data?.event.title}
        </h1>
        {session?.user.role === "admin" && (
          <EventContextMenu event={data?.event} />
        )}
      </SlideAnimation>
      {data.event.image && (
        <SlideAnimation
          direction="up"
          className="h-64 w-full md:h-96"
          transition={{
            delay: 0.3,
            duration: 0.7,
          }}
        >
          <div className="h-full w-full overflow-hidden rounded-[60px]">
            <Image
              src={data.event.image}
              alt={data.event.title ?? "Arrangement"}
              width={2000}
              height={1200}
              className="bg-secondary h-full w-full object-cover object-center"
            />
          </div>
        </SlideAnimation>
      )}
      <div className="flex h-fit w-full flex-col gap-5 md:h-fit md:min-h-full md:flex-row">
        <SlideAnimation
          direction="up"
          className="h-fit w-full md:w-96"
          transition={{
            delay: 0.4,
            duration: 0.5,
          }}
        >
          <div className="flex h-fit w-full flex-col gap-5 md:min-h-full">
            <div className="bg-secondary flex h-full w-full flex-col gap-2.5 rounded-[60px] p-10 md:h-full">
              <div>
                <h3 className="font-semibold">Dato</h3>
                <h4>
                  {formatEventDateRange(data.event.start, data.event.end)}
                </h4>
              </div>

              {data?.event.updatedAt && (
                <div>
                  <h3 className="font-semibold">Sted</h3>
                  <h4>
                    {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
                    {data?.event.location
                      ? data?.event.location
                      : "Ikke spesifisert"}
                  </h4>
                </div>
              )}
            </div>
          </div>
        </SlideAnimation>
        <SlideAnimation className="h-fit min-h-full w-full">
          <div className="bg-accent h-full rounded-[60px] p-10">
            <PortableRenderer
              value={
                JSON.parse(
                  data?.event.description ?? "[]",
                ) as PortableTextBlock[]
              }
            />
          </div>
        </SlideAnimation>
      </div>
      {/* {session && (
        <EventChat
          className="max-h-full w-full md:w-fit"
          eventId={Number(id)}
        />
      )} */}
    </SlideAnimation>
  );
}

export default Page;
