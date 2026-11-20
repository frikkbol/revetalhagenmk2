"use client";

import CreateEventForm from "@/components/forms/create-event-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { event } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { Loader2Icon, PlusIcon, SaveIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface EventEditorProps {
  defaultEvent?: typeof event.$inferSelect;
}

export default function EventEditor({ defaultEvent }: EventEditorProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const isEditing = Boolean(defaultEvent);
  const cancelHref = defaultEvent
    ? `/arrangementer/${defaultEvent.id}`
    : "/arrangementer";

  const { mutate: createEvent, isPending: isCreating } =
    api.events.createEvent.useMutation({
      onSuccess: (created) => {
        void utils.events.getEvents.invalidate();
        toast.success("Arrangementet ble opprettet");
        const createdId = created?.id;
        router.push(
          createdId ? `/arrangementer/${createdId}` : "/arrangementer",
        );
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message || "Kunne ikke opprette arrangementet");
      },
    });

  const { mutate: updateEvent, isPending: isUpdating } =
    api.events.updateEvent.useMutation({
      onSuccess: () => {
        void utils.events.getEvents.invalidate();
        if (defaultEvent?.id) {
          void utils.events.getById.invalidate({ id: defaultEvent.id });
        }
        toast.success("Endringene ble lagret");
        router.push(
          defaultEvent
            ? `/arrangementer/${defaultEvent.id}`
            : "/arrangementer",
        );
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message || "Kunne ikke lagre endringene");
      },
    });

  const isPending = isCreating || isUpdating;

  return (
    <Card className="w-full rounded-3xl">
      <CardContent className="p-6 md:p-8">
        <CreateEventForm
          defaultValues={defaultEvent}
          onSubmit={(data) => {
            if (!defaultEvent) {
              createEvent(data);
            } else {
              updateEvent({
                ...data,
                id: defaultEvent.id,
              });
            }
          }}
        >
          {() => (
            <div className="border-border flex flex-col-reverse justify-end gap-3 border-t pt-6 sm:flex-row">
              <Button type="button" variant="ghost" asChild disabled={isPending}>
                <Link href={cancelHref}>
                  <XIcon />
                  Avbryt
                </Link>
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2Icon className="animate-spin" />
                    {isEditing ? "Lagrer..." : "Oppretter..."}
                  </>
                ) : isEditing ? (
                  <>
                    <SaveIcon />
                    Lagre endringer
                  </>
                ) : (
                  <>
                    <PlusIcon />
                    Opprett arrangement
                  </>
                )}
              </Button>
            </div>
          )}
        </CreateEventForm>
      </CardContent>
    </Card>
  );
}
