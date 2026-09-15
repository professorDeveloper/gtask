import type { Metadata } from "next";
import { loadCardData } from "./render";

/**
 * Page metadata for /r/[id]. The OG and Twitter images come from the
 * opengraph-image file convention, so only titles and copy live here.
 *
 *   // app/r/[id]/page.tsx
 *   export const generateMetadata = ({ params }) => params.then(({ id }) => reportMetadata(id));
 */
export async function reportMetadata(id: string): Promise<Metadata> {
  const data = await loadCardData(id);
  if (!data) return { title: "Report not found", robots: { index: false } };

  const title = `${data.archetype} · ${data.readiness}/100`;
  const description = `${data.bandName} band on the GTask SAT readiness check. ${
    data.gap > 0 ? `${data.gap} points to target, ${data.countdown}.` : `Already at target, ${data.countdown}.`
  } Five questions, scored by rules you can inspect.`;

  return {
    title,
    description,
    robots: { index: false },
    openGraph: { title, description, type: "article", siteName: "GTask" },
    twitter: { card: "summary_large_image", title, description },
  };
}
