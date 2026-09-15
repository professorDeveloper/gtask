/** Client-safe share copy. */

/** One line a student can post with the link. */
export function shareTextFor(report: { archetype: string; readiness: number; band: { name: string } }): string {
  return `I'm "${report.archetype}": ${report.readiness}/100 (${report.band.name}) on the GTask SAT readiness check. How ready are you?`;
}

export function telegramShareUrl(url: string, text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}
