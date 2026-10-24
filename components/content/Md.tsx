import { Fragment, type ReactNode } from "react";

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g;
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

/** Only web, email and on-site links; anything else is shown as plain text. */
function safeHref(href: string): string | null {
  return /^(https?:\/\/|mailto:|\/)/.test(href) ? href : null;
}

/** Inline Markdown: **bold**, *italic* and [links](https://…). No HTML. */
export function Md({ text }: { text: string }) {
  return (
    <>
      {text.split(INLINE).map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong key={i} className="font-semibold text-ink">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        const link = LINK.exec(part);
        const href = link && safeHref(link[2]);
        if (link && href) {
          return (
            <a key={i} href={href} className="underline decoration-pink decoration-2 underline-offset-4 hover:text-pink-text">
              {link[1]}
            </a>
          );
        }
        return <Fragment key={i}>{link ? link[1] : part}</Fragment>;
      })}
    </>
  );
}

type MdBlock = { type: "p"; text: string } | { type: "ul"; items: string[] };

/** Splits Markdown into paragraphs (blank-line separated) and "- " lists. */
export function parseBlocks(text: string): MdBlock[] {
  const blocks: MdBlock[] = [];
  for (const chunk of text.replace(/\r\n/g, "\n").split(/\n\s*\n/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    if (lines.every((l) => /^[-*] /.test(l))) {
      blocks.push({ type: "ul", items: lines.map((l) => l.slice(2)) });
    } else {
      blocks.push({ type: "p", text: lines.join(" ") });
    }
  }
  return blocks;
}

/** The paragraphs of a Markdown block, for layouts that place each one (race stories). */
export function paragraphsOf(text: string | undefined): string[] {
  return parseBlocks(text ?? "").flatMap((b) => (b.type === "p" ? [b.text] : b.items));
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {items.map((item, i) => (
        <li key={i} className="relative pl-6">
          <span aria-hidden className="absolute top-[0.8em] left-0 h-0.5 w-3 bg-pink" />
          {item}
        </li>
      ))}
    </ul>
  );
}

/** A Markdown text block at the design system's body size. */
export function Markdown({
  text,
  small,
  className = "",
}: {
  text: string | undefined;
  /** 17 px instead of 18 px, for notes and narrow columns. */
  small?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex max-w-[68ch] flex-col gap-5 leading-[1.7] ${small ? "text-[17px]" : "text-[18px]"} ${className}`}>
      {parseBlocks(text ?? "").map((block, i) =>
        block.type === "p" ? (
          <p key={i}>
            <Md text={block.text} />
          </p>
        ) : (
          <Bullets key={i} items={block.items.map((item, j) => <Md key={j} text={item} />)} />
        ),
      )}
    </div>
  );
}
