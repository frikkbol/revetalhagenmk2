"use client";

import CreateNewsForm from "@/components/forms/create-news-form/create-news-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { news } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { Loader2Icon, PlusIcon, SaveIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface NewsEditorProps {
  defaultValues?: typeof news.$inferSelect;
}

export default function NewsEditor({ defaultValues }: NewsEditorProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const isEditing = Boolean(defaultValues);
  const cancelHref = defaultValues ? `/nyheter/${defaultValues.id}` : "/nyheter";

  const { mutate: createNews, isPending: isCreating } =
    api.news.create.useMutation({
      onSuccess: (created) => {
        void utils.news.getAllInfinite.invalidate();
        toast.success("Nyheten ble publisert");
        const createdId = created?.[0]?.id;
        router.push(createdId ? `/nyheter/${createdId}` : "/nyheter");
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message || "Kunne ikke opprette nyheten");
      },
    });

  const { mutate: updateNews, isPending: isUpdating } =
    api.news.update.useMutation({
      onSuccess: () => {
        void utils.news.getAllInfinite.invalidate();
        if (defaultValues?.id) {
          void utils.news.getById.invalidate({ id: defaultValues.id });
        }
        toast.success("Endringene ble lagret");
        router.push(defaultValues ? `/nyheter/${defaultValues.id}` : "/nyheter");
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
        <CreateNewsForm
          defaultValues={
            defaultValues
              ? {
                  title: defaultValues.name ?? "",
                  content: defaultValues.content ?? "[]",
                  preview: defaultValues.preview ?? "",
                  image: defaultValues.image ?? "",
                }
              : undefined
          }
          onSubmit={(data) => {
            if (!defaultValues) {
              createNews(data);
            } else {
              updateNews({
                id: defaultValues.id,
                title: data.title,
                content: data.content,
                preview: data.preview,
                image: data.image,
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
                    {isEditing ? "Lagrer..." : "Publiserer..."}
                  </>
                ) : isEditing ? (
                  <>
                    <SaveIcon />
                    Lagre endringer
                  </>
                ) : (
                  <>
                    <PlusIcon />
                    Publiser nyhet
                  </>
                )}
              </Button>
            </div>
          )}
        </CreateNewsForm>
      </CardContent>
    </Card>
  );
}
