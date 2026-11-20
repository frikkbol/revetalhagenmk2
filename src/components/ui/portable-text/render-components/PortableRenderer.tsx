import { cn } from "@/lib/utils";
import { PortableText } from "@portabletext/react";
import React, { type ComponentProps } from "react";
import { ImageZoom } from "../../shadcn-io/image-zoom";
import PortableH1 from "./h1";
import PortableH2 from "./h2";
import PortableH3 from "./h3";
import PortableQuote from "./quote";

type PortableBlockValue = {
  children?: Array<{
    text?: string;
  }>;
};

type PortableImageValue = {
  url?: string;
  alt?: string;
};

function PortableRenderer({
  value,
  ...props
}: {
  value?: ComponentProps<typeof PortableText>["value"];
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props}>
      {value && (
        <PortableText
          value={value ?? []}
          components={{
            types: {
              image: ({ value }: { value?: PortableImageValue }) => {
                if (!value?.url) return null;
                return (
                  <figure className="my-6">
                    <ImageZoom>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={value.url}
                        alt={value.alt ?? "Bilde"}
                        loading="lazy"
                        className="max-h-[540px] w-full rounded-2xl object-contain"
                      />
                    </ImageZoom>
                  </figure>
                );
              },
            },
            block: {
              normal: ({ children, value }) => {
                const text = (value as PortableBlockValue | undefined)?.children
                  ?.map((child) => child.text ?? "")
                  .join("");
                const isEmptyBlock = !text || text.trim().length === 0;

                return (
                  <p
                    className={cn(
                      "leading-relaxed whitespace-pre-wrap",
                      isEmptyBlock && "min-h-[1.5em]",
                    )}
                  >
                    {isEmptyBlock ? "\u00A0" : children}
                  </p>
                );
              },
              h1: ({ children }) => <PortableH1>{children}</PortableH1>,
              h2: ({ children }) => <PortableH2>{children}</PortableH2>,
              h3: ({ children }) => <PortableH3>{children}</PortableH3>,
              blockquote: ({ children }) => (
                <PortableQuote>{children}</PortableQuote>
              ),
            },
          }}
        />
      )}
    </div>
  );
}

export default PortableRenderer;
