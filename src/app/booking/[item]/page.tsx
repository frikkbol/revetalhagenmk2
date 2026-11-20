import BookingForm from "@/components/forms/booking-form/booking-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import CreateItemMeta from "@/components/ui/create-item-meta";
import DeleteItemMeta from "@/components/ui/delete-item-meta";
import EditableItemDescription from "@/components/ui/editable-item-description";
import { Separator } from "@/components/ui/separator";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import { ItemType } from "@/lib/item-type";
import { cn } from "@/lib/utils";
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { ArrowRight, CheckIcon, TriangleAlertIcon } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { headers } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";

async function Item({
  params,
  searchParams,
}: {
  params: Promise<{ item: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { item } = await params;
  const itemId = Number(item);
  if (!Number.isInteger(itemId) || itemId <= 0) {
    notFound();
  }

  const { from, to } = await searchParams;
  const parsedFrom = from ? new Date(from) : undefined;
  const parsedTo = to ? new Date(to) : undefined;
  const hasValidDateRange = Boolean(
    parsedFrom &&
      parsedTo &&
      !Number.isNaN(parsedFrom.getTime()) &&
      !Number.isNaN(parsedTo.getTime()),
  );

  const availability =
    hasValidDateRange && parsedFrom && parsedTo
      ? await api.booking.checkAvailability({
          itemId,
          from: parsedFrom,
          to: parsedTo,
        })
      : undefined;

  const itemData = await api.booking.getItemById({ id: itemId });
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!itemData)
    return (
      <div className="flex min-h-screen w-full flex-col gap-5 px-5 pt-20 pb-10 md:px-10">
        <span className="text-2xl font-medium">
          Kunne ikke finne gjenstanden
        </span>
      </div>
    );

  const price = `Fra ${itemData.type === ItemType.OVERNATTING ? itemData.price + itemData.personPrice : itemData.price} kroner`;
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-5 px-5 pt-32 pb-10 md:px-10">
      <div className="relative h-56 w-full rounded-3xl md:h-96">
        <Carousel
          className="h-56 w-full max-w-[100%_-_10rem] md:h-96"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="h-full w-full flex-1">
            {itemData.itemImage?.map((image) => (
              <CarouselItem className="md:basis-1/3" key={image.id + "image"}>
                <ImageZoom>
                  <Image
                    src={image.url}
                    alt={"Bilde av gjenstanden"}
                    className="h-56 w-full rounded-3xl object-cover md:h-96"
                    width={1000}
                    unoptimized
                    height={1000}
                  />
                </ImageZoom>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div
          className={cn(
            "mx-auto hidden w-fit flex-row items-center gap-2.5 opacity-50 max-sm:flex",
            itemData.itemImage?.length === 1 ? "hidden" : undefined,
          )}
        >
          <span>Sveip for flere bilder</span>
          <ArrowRight className="animate-bounce-right" size={16} />
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-2.5">
        {itemData.type && (
          <Badge className="capitalize">
            {ItemType[itemData.type]?.toLowerCase()}
          </Badge>
        )}
        <h1 className="w-fit text-3xl font-black md:text-5xl">
          {itemData.name}
        </h1>
        {availability === true && hasValidDateRange && parsedFrom && parsedTo && (
          <Badge>
            <CheckIcon />
            Ledig fra{" "}
            {format(parsedFrom, "do LLL yyy", {
              locale: nb,
            })}{" "}
            til{" "}
            {format(parsedTo, "do LLL yyy", {
              locale: nb,
            })}
          </Badge>
        )}
        {availability === false &&
          hasValidDateRange &&
          parsedFrom &&
          parsedTo && (
            <Badge variant="destructive">
              <TriangleAlertIcon />
              Ikke ledig fra{" "}
              {format(parsedFrom, "do LLL yyy", {
                locale: nb,
              })}{" "}
              til{" "}
              {format(parsedTo, "do LLL yyy", {
                locale: nb,
              })}
            </Badge>
          )}
        <Card className="mt-5 gap-2.5">
          <CardContent className="flex flex-col gap-5">
            <Badge variant="secondary">
              {itemData.type && (
                <span className="flex items-center gap-2.5">
                  <DynamicIcon name="banknote" />
                  {price}
                </span>
              )}
            </Badge>

            <div className="flex flex-col flex-wrap gap-2.5 md:flex-row md:gap-5">
              {itemData.itemMeta.map((meta) => (
                <span
                  className="flex items-center gap-2.5"
                  key={meta.id + "meta"}
                >
                  {meta.icon && <DynamicIcon name={meta.icon as IconName} />}
                  {meta.label}
                  {session?.user.role?.includes("admin") && (
                    <DeleteItemMeta id={Number(meta.id)} />
                  )}
                </span>
              ))}
              {session?.user.role?.includes("admin") && (
                <CreateItemMeta itemId={itemId} />
              )}
              <Separator orientation="horizontal" />

              <div>
                <EditableItemDescription
                  itemId={itemId}
                  description={itemData.description ?? ""}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <BookingForm
          item={{
            id: itemData.id,
            name: itemData.name ?? "Ukjent gjenstand",
          }}
          memberPriceDiscount={itemData.memberDiscount}
          type={itemData.type as ItemType}
          basePrice={itemData.price}
          personPrice={itemData.personPrice}
        />
      </div>
    </div>
  );
}

export default Item;
