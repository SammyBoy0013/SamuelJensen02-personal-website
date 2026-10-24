import type { ReactNode } from "react";

/** Heading for an admin page, with an optional short explanation. */
export function AdminTitle({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="font-serif text-[clamp(36px,4vw,56px)] leading-[1.02] font-semibold text-ink">{title}</h1>
      {children && <div className="max-w-[68ch] text-[16px] leading-[1.6] text-grey-1">{children}</div>}
    </div>
  );
}
