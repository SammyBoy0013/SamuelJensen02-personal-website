"use client";

import { useEffect, useState } from "react";

type Props = {
  email: string;
  label: string;
  copied: string;
  failed: string;
  className?: string;
  id?: string;
};

/** "Copy address": copies the email address and confirms with "Copied" (specification 5.10). */
export function CopyAddress({ email, label, copied, failed, className = "", id }: Props) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = setTimeout(() => setState("idle"), 2500);
    return () => clearTimeout(timer);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      setState("failed");
    }
  };

  return (
    <button id={id} type="button" onClick={copy} className={`cursor-pointer ${className}`}>
      <span>{state === "copied" ? copied : label}</span>
      {state === "copied" && <span aria-hidden>✓</span>}
      <span role="status" className="sr-only">
        {state === "copied" ? copied : state === "failed" ? failed : ""}
      </span>
      {state === "failed" && <span className="normal-case tracking-normal text-grey-2">{failed}</span>}
    </button>
  );
}
