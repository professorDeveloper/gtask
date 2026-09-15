"use client";

import { MotionConfig } from "motion/react";
import { ToastHost } from "./Toast";

/** App-wide client context: reduced-motion aware springs and the toast host. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
      <ToastHost />
    </MotionConfig>
  );
}
