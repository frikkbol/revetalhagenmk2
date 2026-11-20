"use client";

import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { ImagePlusIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "./button";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { startUpload, isUploading } = useUploadThing("coverImage", {
    onClientUploadComplete: (res) => {
      const uploaded = res?.[0];
      if (uploaded?.ufsUrl) {
        onChange(uploaded.ufsUrl);
        toast.success("Bilde lastet opp");
      }
    },
    onUploadError: (error) => {
      toast.error(error.message || "Kunne ikke laste opp bilde");
    },
  });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Kun bildefiler er støttet");
      return;
    }
    await startUpload([file]);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={isUploading}
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {value ? (
        <div className="border-border bg-muted/30 relative overflow-hidden rounded-xl border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Forhåndsvisning av forsidebilde"
            className="max-h-56 w-full object-cover"
          />
          <div className="absolute right-2 bottom-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
            >
              {isUploading ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <ImagePlusIcon />
              )}
              Bytt bilde
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={isUploading}
              onClick={() => onChange("")}
            >
              <Trash2Icon />
              Fjern
            </Button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !isUploading && inputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !isUploading) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (!isUploading) {
              void handleFiles(e.dataTransfer.files);
            }
          }}
          className={cn(
            "border-border hover:bg-muted/40 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
            isDragging && "border-primary bg-muted/60",
            isUploading && "pointer-events-none opacity-60",
          )}
        >
          {isUploading ? (
            <>
              <Loader2Icon className="text-muted-foreground size-6 animate-spin" />
              <p className="text-muted-foreground text-sm">
                Laster opp bilde...
              </p>
            </>
          ) : (
            <>
              <ImagePlusIcon className="text-muted-foreground size-6" />
              <p className="text-sm font-medium">
                Klikk eller dra et bilde hit
              </p>
              <p className="text-muted-foreground text-xs">
                PNG, JPG eller WebP (maks 4 MB)
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
