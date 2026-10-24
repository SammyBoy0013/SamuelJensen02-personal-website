import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";

type Props = {
  id: string;
  title: string;
  /** Small label above the title. */
  eyebrow?: string;
  children: ReactNode;
  className?: string;
};

/** A page section: anchor, h2 and content that fades up once. */
export function Section({ id, title, eyebrow, children, className = "" }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`border-t border-line first-of-type:border-t-0 ${className}`}>
      <Reveal className="wrap flex flex-col gap-10 py-16 nav:py-24">
        <div className="flex flex-col gap-3">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 id={`${id}-title`} className="section-title">
            {title}
          </h2>
        </div>
        {children}
      </Reveal>
    </section>
  );
}

/** Text column beside a media column; stacks below 900 px. */
export function Split({ children, reverse }: { children: ReactNode; reverse?: boolean }) {
  return (
    <div
      className={`grid grid-cols-1 items-start gap-10 nav:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] nav:gap-[clamp(32px,5vw,80px)] ${
        reverse ? "nav:[&>*:first-child]:order-2" : ""
      }`}
    >
      {children}
    </div>
  );
}

/** h3 inside a section. */
export function SubTitle({ children }: { children: ReactNode }) {
  return <h3 className="font-sans text-[13px] font-medium tracking-[0.16em] text-grey-2 uppercase">{children}</h3>;
}
