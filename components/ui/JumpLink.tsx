"use client";

import type { ComponentProps } from "react";
import { onJumpClick } from "./jumpTo";

/** An in-page `#section` link that jumps like the nav instead of scrolling through the page. */
export function JumpLink(props: ComponentProps<"a"> & { href: `#${string}` }) {
  return <a {...props} onClick={onJumpClick} />;
}
