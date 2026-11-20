"use client";
import { api } from "@/trpc/react";
import { Loader, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./button";

function DeleteItemMeta({ id }: { id: number }) {
  const { mutateAsync } = api.booking.deleteItemMeta.useMutation();
  const [loading, setLoading] = useState(false);
  const utils = api.useUtils();
  const router = useRouter();
  const handleDelete = () => {
    setLoading(true);
    void mutateAsync({ id })
      .then(() => {
        toast("Informasjonsbrikken er slettet.");
        void utils.booking.getItemById.invalidate();
        router.refresh();
      })
      .catch(() => {
        toast("Kunne ikke slette informasjonsbrikken");
      })
      .finally(() => setLoading(false));
  };

  return (
    <Button
      onClick={handleDelete}
      variant={"ghost"}
      size="sm"
      disabled={loading}
    >
      {!loading ? <XIcon /> : <Loader className="animate-spin" />}
    </Button>
  );
}

export default DeleteItemMeta;
