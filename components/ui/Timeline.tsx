import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/** Vertical timeline: a `--line` rule, pink dots, year in Bodoni, text in Archivo. */
export function Timeline({ label, items }: { label: string; items: { year: string; text: ReactNode }[] }) {
  return (
    <ol aria-label={label} className="relative flex max-w-[760px] flex-col gap-8 pl-9">
      <span aria-hidden className="absolute top-2 bottom-2 left-[5px] w-px bg-line" />
      {items.map((item) => (
        <Reveal as="li" key={item.year} className="relative flex flex-col gap-1 nav:flex-row nav:gap-8">
          <span aria-hidden className="absolute top-[0.55em] -left-9 size-[11px] rounded-full bg-pink ring-4 ring-paper" />
          <span className="font-serif text-[24px] leading-tight font-semibold text-ink nav:w-[150px] nav:shrink-0">
            {item.year}
          </span>
          <span className="text-[17px] leading-[1.6] nav:pt-1">{item.text}</span>
        </Reveal>
      ))}
    </ol>
  );
}
