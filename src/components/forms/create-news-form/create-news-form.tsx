"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import TextEditor from "@/components/ui/portable-text/portable-text";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PortableTextBlock } from "@portabletext/editor";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd"),
  content: z.string().min(1, "Innhold er påkrevd"),
  image: z.string().optional(),
  preview: z.string().optional(),
});

export type NewsFormValues = z.infer<typeof formSchema>;

type ChildType = {
  canSubmit: boolean;
  isDirty: boolean;
};

interface CreateNewsFormProps {
  children?: (props: ChildType) => React.ReactNode;
  defaultValues?: NewsFormValues;
  onSubmit?: (data: NewsFormValues) => void;
  formId?: string;
}

function parsePortableText(raw?: string): PortableTextBlock[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PortableTextBlock[]) : [];
  } catch {
    return [];
  }
}

function CreateNewsForm({
  children,
  onSubmit,
  defaultValues,
  formId,
}: CreateNewsFormProps) {
  const form = useForm<NewsFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: defaultValues?.title ?? "",
      content: defaultValues?.content ?? "[]",
      image: defaultValues?.image ?? "",
      preview: defaultValues?.preview ?? "",
    },
  });

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit((values) => onSubmit?.(values))}
        className="flex flex-col gap-6"
      >
        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overskrift</FormLabel>
              <FormControl>
                <Input
                  placeholder="Skriv en engasjerende overskrift..."
                  className="h-12 text-lg font-medium"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="image"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Forsidebilde (valgfritt)</FormLabel>
              <FormControl>
                <ImageUpload value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="preview"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kort oppsummering (valgfritt)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={3}
                  placeholder="Kort oppsummering av artikkelen som vises i oversikten og nyhetsbrevet..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="content"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Innhold</FormLabel>
              <FormControl>
                <TextEditor
                  stickyToolbar
                  editorClassName="min-h-[360px]"
                  onChange={(value) => {
                    field.onChange(JSON.stringify(value ?? []));
                  }}
                  value={parsePortableText(field.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {children?.({
          canSubmit: form.formState.isValid,
          isDirty: form.formState.isDirty,
        })}
      </form>
    </Form>
  );
}

export default CreateNewsForm;
