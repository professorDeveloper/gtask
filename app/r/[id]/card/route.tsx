import { loadCardData, renderShareImage } from "@/components/share/render";

export const dynamic = "force-dynamic";

/**
 * GET /r/<id>/card — the portrait 1080×1350 share card behind "Save image".
 * `?download=1` asks the browser to save it as a file.
 * Not cached: refining the report changes the score on the card.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await loadCardData(id);
  if (!data) return new Response("Report not found", { status: 404 });

  const download = new URL(request.url).searchParams.has("download");
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (download) headers["Content-Disposition"] = `attachment; filename="${fileNameFor(data.archetype, data.readiness)}"`;
  return renderShareImage(data, "portrait", { headers });
}

function fileNameFor(archetype: string, readiness: number) {
  const slug = archetype.toLowerCase().replace(/^the\s+/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `gtask-${slug || "report"}-${readiness}.png`;
}
