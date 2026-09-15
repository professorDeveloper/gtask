import { CARD_SIZE } from "@/components/share/card";
import { loadCardData, renderShareImage } from "@/components/share/render";

export const alt = "GTask SAT readiness report: score, archetype and band";
export const size = CARD_SIZE.og;
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return renderShareImage(await loadCardData(id), "og");
}
