"use client";

import { useUploadThing } from "@/lib/uploadthing";
import type {
  PortableTextBlock,
  RenderAnnotationFunction,
  RenderBlockFunction,
  RenderDecoratorFunction,
  RenderStyleFunction,
} from "@portabletext/editor";
import {
  defineSchema,
  EditorProvider,
  PortableTextEditable,
  useEditor,
} from "@portabletext/editor";
import { EventListenerPlugin } from "@portabletext/editor/plugins";
import {
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  LinkIcon,
  Loader2Icon,
  Quote,
  RemoveFormatting,
  Trash2Icon,
  Underline,
} from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "../button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";
import PortableH1 from "./render-components/h1";
import PortableH2 from "./render-components/h2";
import PortableH3 from "./render-components/h3";
import PortableLink from "./render-components/link";
import PortableQuote from "./render-components/quote";

const schemaDefinition = defineSchema({
  decorators: [
    { name: "strong", title: "Uthevet", icon: <Bold /> },
    { name: "em", title: "Kursiv", icon: <Italic /> },
    { name: "underline", title: "Understreket", icon: <Underline /> },
    { name: "left", title: "Venstrejustert", icon: <AlignLeft /> },
    {
      name: "right",
      title: "Høyrejustert",
      icon: <AlignRight />,
      value: "right",
    },
  ],
  styles: [
    { name: "normal", title: "Normal", icon: <RemoveFormatting /> },
    { name: "h1", title: "Tittel 1", icon: <Heading1 /> },
    { name: "h2", title: "Tittel 2", icon: <Heading2 /> },
    { name: "h3", title: "Tittel 3", icon: <Heading3 /> },
    { name: "blockquote", title: "Sitat", icon: <Quote /> },
  ],
  annotations: [
    {
      name: "link",
      title: "Lenke",
      icon: <LinkIcon />,
      type: {
        name: "link",
        type: "object",
        fields: [
          {
            name: "href",
            type: "string",
            title: "URL",
          },
        ],
      },
    },
  ],
  lists: [],
  inlineObjects: [],
  blockObjects: [
    {
      name: "image",
      title: "Bilde",
      fields: [
        { name: "url", type: "string", title: "URL" },
        { name: "alt", type: "string", title: "Alternativ tekst" },
        { name: "fileKey", type: "string", title: "Filnøkkel" },
      ],
    },
  ],
});

const renderStyle: RenderStyleFunction = (props) => {
  if (props.schemaType.value === "h1") {
    return <PortableH1>{props.children}</PortableH1>;
  }
  if (props.schemaType.value === "h2") {
    return <PortableH2>{props.children}</PortableH2>;
  }
  if (props.schemaType.value === "h3") {
    return <PortableH3>{props.children}</PortableH3>;
  }
  if (props.schemaType.value === "blockquote") {
    return <PortableQuote>{props.children}</PortableQuote>;
  }
  return <>{props.children}</>;
};

const renderDecorator: RenderDecoratorFunction = (props) => {
  if (props.value === "strong") {
    return <strong>{props.children}</strong>;
  }
  if (props.value === "em") {
    return <em>{props.children}</em>;
  }
  if (props.value === "underline") {
    return <u>{props.children}</u>;
  }
  return <>{props.children}</>;
};

const renderAnnotation: RenderAnnotationFunction = (props) => {
  if (props.schemaType.name === "link") {
    return (
      <PortableLink href={props.value.href as string}>
        {props.children}
      </PortableLink>
    );
  }

  return <>{props.children}</>;
};

function ImageBlockPreview({
  url,
  alt,
  blockKey,
}: {
  url: string;
  alt?: string;
  blockKey: string;
}) {
  const editor = useEditor();

  return (
    <div
      contentEditable={false}
      className="border-border bg-muted/30 relative my-3 overflow-hidden rounded-xl border"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt ?? "Opplastet bilde"}
        className="max-h-72 w-full object-contain"
      />
      <Button
        type="button"
        size="icon"
        variant="destructive"
        className="absolute top-2 right-2 size-8"
        title="Fjern bilde"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          editor.send({
            type: "delete.block",
            at: [{ _key: blockKey }],
          });
        }}
      >
        <Trash2Icon className="size-4" />
      </Button>
    </div>
  );
}

const renderBlock: RenderBlockFunction = (props) => {
  if (props.schemaType.name === "image") {
    const value = props.value as {
      _key: string;
      url?: string;
      alt?: string;
    };

    if (value.url) {
      return (
        <ImageBlockPreview
          url={value.url}
          alt={value.alt}
          blockKey={value._key}
        />
      );
    }
  }

  return <>{props.children}</>;
};

type TextEditorProps = {
  value?: Array<PortableTextBlock>;
  onChange?: (value?: Array<PortableTextBlock>) => void;
};

function TextEditor({ value, onChange }: TextEditorProps) {
  return (
    <div>
      <EditorProvider
        initialConfig={{
          schemaDefinition,
          initialValue: value,
        }}
      >
        <EventListenerPlugin
          on={(event) => {
            if (event.type === "mutation") {
              onChange?.(event.value);
            }
          }}
        />
        <div className="flex flex-col gap-2.5">
          <Toolbar />
          <PortableTextEditable
            className="border-border min-h-32 rounded-xl border p-5"
            renderBlock={renderBlock}
            renderStyle={renderStyle}
            renderDecorator={renderDecorator}
            renderAnnotation={renderAnnotation}
            renderListItem={(props) => <>{props.children}</>}
          />
        </div>
      </EditorProvider>
    </div>
  );
}

function Toolbar() {
  const editor = useEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("inlineImage", {
    onClientUploadComplete: (res) => {
      const uploaded = res?.[0];
      if (!uploaded?.ufsUrl) return;

      editor.send({
        type: "insert.block object",
        blockObject: {
          name: "image",
          value: {
            url: uploaded.ufsUrl,
            alt: uploaded.name,
            fileKey: uploaded.key,
          },
        },
        placement: "auto",
      });
      editor.send({ type: "focus" });
      toast.success("Bilde satt inn");
    },
    onUploadError: (error) => {
      toast.error(error.message || "Kunne ikke laste opp bilde");
    },
  });

  const handleImageSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Kun bildefiler er støttet");
      return;
    }
    await startUpload([file]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const styleButtons = schemaDefinition.styles.map((style) => (
    <Tooltip key={style.name}>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            editor.send({
              type: "style.toggle",
              style: style.name,
            });
            editor.send({
              type: "focus",
            });
          }}
        >
          {style.icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{style.title}</TooltipContent>
    </Tooltip>
  ));

  const decoratorButtons = schemaDefinition.decorators.map((decorator) => (
    <Tooltip key={decorator.name}>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            editor.send({
              type: "decorator.toggle",
              decorator: decorator.name,
            });
            editor.send({
              type: "focus",
            });
          }}
        >
          {decorator.icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{decorator.title}</TooltipContent>
    </Tooltip>
  ));

  const annotationButtons = schemaDefinition.annotations.map((annotation) => (
    <Tooltip key={annotation.name}>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            toast.error(
              "Denne funksjonen er ikke implementert enda. Prøv igjen seinere.",
            );
          }}
        >
          {annotation.icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{annotation.title}</TooltipContent>
    </Tooltip>
  ));

  return (
    <div className="flex w-full flex-wrap items-center gap-2.5">
      {styleButtons}
      <div className="bg-border h-5 w-0.5" />
      {decoratorButtons}
      <div className="bg-border h-5 w-0.5" />
      {annotationButtons}
      <div className="bg-border h-5 w-0.5" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={isUploading}
        onChange={(e) => void handleImageSelect(e.target.files)}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <ImageIcon />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Sett inn bilde</TooltipContent>
      </Tooltip>
    </div>
  );
}

export default TextEditor;
