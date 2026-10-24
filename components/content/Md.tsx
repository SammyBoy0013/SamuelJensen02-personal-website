import { Fragment } from "react";

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

/** Inline Markdown: **bold** and *italic*. Enough for the page text in content/. */
export function Md({ text }: { text: string }) {
  return (
    <>
      {text.split(INLINE).map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-ink">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

/** Body paragraphs at the design system's body size. */
export function Prose({ paragraphs, className = "" }: { paragraphs: string[]; className?: string }) {
  return (
    <div className={`flex max-w-[68ch] flex-col gap-5 text-[18px] leading-[1.7] ${className}`}>
      {paragraphs.map((p, i) => (
        <p key={i}>
          <Md text={p} />
        </p>
      ))}
    </div>
  );
}

/** Bulleted list with a bold lead-in, as in the Collaborate and Privacy text. */
export function LeadList({ items }: { items: { lead: string; text: string }[] }) {
  return (
    <ul className="flex max-w-[68ch] flex-col gap-4 text-[18px] leading-[1.7]">
      {items.map((item) => (
        <li key={item.lead} className="relative pl-6">
          <span aria-hidden className="absolute top-[0.8em] left-0 h-0.5 w-3 bg-pink" />
          <strong className="font-semibold text-ink">{item.lead}</strong> <Md text={item.text} />
        </li>
      ))}
    </ul>
  );
}
