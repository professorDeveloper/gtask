import type { Metadata } from "next";
import { CheckFlow } from "@/components/check/CheckFlow";

export const metadata: Metadata = {
  title: "The readiness check",
  description: "Five questions about your SAT plan. Sixty seconds, no sign-up.",
};

/** The check owns its whole screen: a compact top bar with progress, then one question at a time. */
export default function CheckPage() {
  return <CheckFlow />;
}
