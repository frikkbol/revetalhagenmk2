import "server-only";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

/**
 * Extracts an UploadThing file key from a URL such as:
 * - https://utfs.io/f/<key>
 * - https://<appId>.ufs.sh/f/<key>
 */
export function extractUploadThingKeyFromUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const isUploadThingHost =
      parsed.hostname === "utfs.io" ||
      parsed.hostname.endsWith(".ufs.sh") ||
      parsed.hostname.endsWith(".uploadthing.com");

    if (!isUploadThingHost) return null;

    const match = /\/f\/([^/?#]+)/.exec(parsed.pathname);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

/**
 * Extracts all UploadThing file keys referenced by image blocks inside
 * a serialized PortableText JSON string.
 */
export function extractUploadThingKeysFromContent(
  content: string | null | undefined,
): string[] {
  if (!content) return [];
  try {
    const parsed: unknown = JSON.parse(content);
    if (!Array.isArray(parsed)) return [];

    const keys: string[] = [];
    for (const block of parsed) {
      if (
        block &&
        typeof block === "object" &&
        "_type" in block &&
        (block as { _type?: unknown })._type === "image"
      ) {
        const imageBlock = block as { fileKey?: unknown; url?: unknown };
        if (typeof imageBlock.fileKey === "string" && imageBlock.fileKey) {
          keys.push(imageBlock.fileKey);
        } else if (typeof imageBlock.url === "string") {
          const extracted = extractUploadThingKeyFromUrl(imageBlock.url);
          if (extracted) keys.push(extracted);
        }
      }
    }
    return keys;
  } catch {
    return [];
  }
}

export async function deleteUploadThingFiles(keys: string[]): Promise<void> {
  const uniqueKeys = [...new Set(keys.filter(Boolean))];
  if (uniqueKeys.length === 0) return;
  if (!process.env.UPLOADTHING_TOKEN) return;

  try {
    await utapi.deleteFiles(uniqueKeys);
  } catch (error) {
    console.error("[UploadThing] Failed to delete files:", uniqueKeys, error);
  }
}

export async function deleteRemovedImages(params: {
  previousImage?: string | null;
  nextImage?: string | null;
  previousContent?: string | null;
  nextContent?: string | null;
}): Promise<void> {
  const previousKeys = new Set<string>();
  const prevCoverKey = extractUploadThingKeyFromUrl(params.previousImage);
  if (prevCoverKey) previousKeys.add(prevCoverKey);
  for (const key of extractUploadThingKeysFromContent(params.previousContent)) {
    previousKeys.add(key);
  }

  const nextKeys = new Set<string>();
  const nextCoverKey = extractUploadThingKeyFromUrl(params.nextImage);
  if (nextCoverKey) nextKeys.add(nextCoverKey);
  for (const key of extractUploadThingKeysFromContent(params.nextContent)) {
    nextKeys.add(key);
  }

  const removedKeys = [...previousKeys].filter((key) => !nextKeys.has(key));
  await deleteUploadThingFiles(removedKeys);
}
