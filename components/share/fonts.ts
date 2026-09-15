import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Brand fonts for the share image, read from TTFs committed next to this
 * file (satori needs TTF/OTF/WOFF, not the woff2 next/font serves).
 * If a file cannot be read the image still renders in the default face.
 */

type Weight = 500 | 700 | 800;
export type ShareFont = { name: string; data: ArrayBuffer; weight: Weight; style: "normal" };

const FILES: { name: string; file: string; weight: Weight }[] = [
  { name: "Gabarito", file: "Gabarito-Bold.ttf", weight: 700 },
  { name: "Gabarito", file: "Gabarito-ExtraBold.ttf", weight: 800 },
  { name: "Manrope", file: "Manrope-Medium.ttf", weight: 500 },
  { name: "Manrope", file: "Manrope-Bold.ttf", weight: 700 },
];

let cache: Promise<ShareFont[]> | null = null;

async function load(): Promise<ShareFont[]> {
  const loaded = await Promise.all(
    FILES.map(async ({ name, file, weight }): Promise<ShareFont | null> => {
      try {
        const buf = await readFile(join(process.cwd(), "components/share/fonts", file));
        const data = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
        return { name, data, weight, style: "normal" };
      } catch {
        return null;
      }
    }),
  );
  return loaded.filter((f): f is ShareFont => f !== null);
}

export function shareFonts(): Promise<ShareFont[]> {
  return (cache ??= load());
}

/** CSS font stacks; the fallback is the renderer's built-in face. */
export const FACE = {
  display: "Gabarito, sans-serif",
  body: "Manrope, sans-serif",
} as const;
