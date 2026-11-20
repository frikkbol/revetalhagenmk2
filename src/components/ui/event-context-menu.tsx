"use client";
import type { event } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { EllipsisVertical, PencilIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface EventContextMenuProps {
  event?: typeof event.$inferSelect;
}
function EventContextMenu({ event }: EventContextMenuProps) {
  const { mutateAsync: deleteEvent } = api.events.deleteEvent.useMutation();
  const router = useRouter();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"outline"}>
          <EllipsisVertical />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-1">
        {event && (
          <Button variant={"outline"} asChild>
            <Link href={`/arrangementer/${event.id}/rediger`}>
              <PencilIcon />
              Rediger arrangement
            </Link>
          </Button>
        )}
        <Button
          variant={"destructive"}
          onClick={() => {
            if (!event) return;
            void deleteEvent({ id: Number(event?.id) }).then(() => {
              router.replace("/arrangementer");
            });
          }}
        >
          <TrashIcon />
          Slett
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export default EventContextMenu;
