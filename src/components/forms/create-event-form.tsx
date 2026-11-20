"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { event } from "@/server/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PortableTextBlock } from "@portabletext/editor";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DatetimePicker } from "../ui/datetime-picker";
import { ImageUpload } from "../ui/image-upload";
import TextEditor from "../ui/portable-text/portable-text";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd"),
  content: z.string().min(1, "Beskrivelse er påkrevd"),
  start: z.date({
    message: "Starttidspunkt er påkrevd",
  }),
  end: z.date({
    message: "Sluttidspunkt er påkrevd",
  }),
  image: z.string().optional(),
  location: z.string().optional(),
  preview: z.string().optional(),
});

export type EventFormValues = z.infer<typeof formSchema>;

type ChildType = {
  canSubmit: boolean;
  isDirty: boolean;
};

interface CreateEventFormProps {
  children?: (props: ChildType) => React.ReactNode;
  onSubmit?: (data: EventFormValues) => void;
  defaultValues?: typeof event.$inferSelect;
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

function CreateEventForm({
  defaultValues,
  children,
  onSubmit,
  formId,
}: CreateEventFormProps) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: defaultValues?.title ?? "",
      content: defaultValues?.description ?? "[]",
      start: defaultValues?.start ? new Date(defaultValues.start) : new Date(),
      end: defaultValues?.end ? new Date(defaultValues.end) : new Date(),
      image: defaultValues?.image ?? "",
      location: defaultValues?.location ?? "",
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
              <FormLabel>Tittel</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Fingerhekling med..."
                  className="h-12 text-lg font-medium"
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            name="start"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start</FormLabel>
                <FormControl>
                  <DatetimePicker
                    {...field}
                    format={[
                      ["days", "months", "years"],
                      ["hours", "minutes"],
                    ]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="end"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slutt</FormLabel>
                <FormControl>
                  <DatetimePicker
                    {...field}
                    format={[
                      ["days", "months", "years"],
                      ["hours", "minutes"],
                    ]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          name="location"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sted (valgfritt)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Revetalhagen..." />
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
                  placeholder="Kort oppsummering av arrangementet som vises i oversikten..."
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
              <FormLabel>Beskrivelse</FormLabel>
              <FormControl>
                <TextEditor
                  stickyToolbar
                  editorClassName="min-h-[320px]"
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

export default CreateEventForm;
