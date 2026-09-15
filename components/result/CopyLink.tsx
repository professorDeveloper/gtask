"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

export function CopyLink() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      onClick={copy}
      className="lift elev-1 inline-flex h-11 items-center gap-2.5 rounded-full border border-line-strong bg-surface px-5 text-[14.5px] font-semibold hover:border-brand hover:text-brand"
    >
      <Icon name={copied ? "check" : "share"} size={17} />
      {copied ? "Link copied" : "Copy report link"}
    </button>
  );
}
