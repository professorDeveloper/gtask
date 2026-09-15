import { ImageResponse } from "next/og";
import { getSubmission } from "@/lib/store";
import { CARD_SIZE, ShareCard, cardDataFor, type CardData, type CardFormat } from "./card";
import { shareFonts } from "./fonts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Card data for a report id, or null when the id is malformed, missing or unreadable. */
export async function loadCardData(id: string): Promise<CardData | null> {
  if (!UUID.test(id)) return null;
  try {
    const submission = await getSubmission(id);
    return submission ? cardDataFor(submission) : null;
  } catch {
    return null;
  }
}

/** Renders the share card for a report as a PNG response. */
export async function renderShareImage(
  data: CardData | null,
  format: CardFormat,
  init?: { headers?: Record<string, string> },
): Promise<ImageResponse> {
  const fonts = await shareFonts();
  return new ImageResponse(<ShareCard data={data} format={format} />, {
    ...CARD_SIZE[format],
    fonts,
    headers: init?.headers,
  });
}
