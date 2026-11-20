"use client";
import type { news } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { EllipsisVertical, PencilIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface NewsContextMenuProps {
  news: typeof news.$inferSelect;
}
function NewsContextMenu({ news }: NewsContextMenuProps) {
  const { mutateAsync: deleteNews } = api.news.delete.useMutation();
  const router = useRouter();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"outline"}>
          <EllipsisVertical />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-1">
        <Button variant={"outline"} asChild>
          <Link href={`/nyheter/${news.id}/rediger`}>
            <PencilIcon />
            Rediger
          </Link>
        </Button>
        <Button
          variant={"destructive"}
          onClick={() => {
            if (!news) return;
            void deleteNews({ id: Number(news?.id) }).then(() => {
              router.replace("/nyheter");
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

export default NewsContextMenu;
