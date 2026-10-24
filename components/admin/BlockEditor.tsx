"use client";

import { useState, useTransition } from "react";
import { Markdown } from "@/components/content/Md";
import { saveBlock, type ActionResult } from "@/lib/admin/actions";
import type { BlockDef } from "@/lib/blocks";
import type { LocaleCode } from "@/lib/admin/validation";
import { attempt, LocaleTabs, Status } from "./fields";

type Texts = Record<LocaleCode, string>;

/**
 * One text block: a tab per language, a Markdown editor and a live preview in
 * the site's body style. Each language saves on its own.
 */
export function BlockEditor({ page, block, initial }: { page: string; block: Omit<BlockDef, "seed">; initial: Texts }) {
  const [locale, setLocale] = useState<LocaleCode>("en");
  const [texts, setTexts] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [status, setStatus] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const id = `block-${block.key}`;
  const dirty = texts[locale] !== saved[locale];
  const body = texts[locale];

  const save = () => {
    setStatus(null);
    startTransition(async () => {
      const result = await attempt(() => saveBlock({ page, key: block.key, locale, body }));
      setStatus(result);
      if (result.ok) setSaved((s) => ({ ...s, [locale]: body }));
    });
  };

  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col gap-4 rounded border border-line bg-white p-5 nav:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={`${id}-title`} className="font-serif text-[24px] leading-tight font-semibold text-ink">
          {block.label}
        </h2>
        <LocaleTabs
          active={locale}
          onSelect={(l) => {
            setLocale(l);
            setStatus(null);
          }}
          filled={(l) => Boolean(texts[l].trim())}
          controls={id}
        />
      </div>
      {block.help && <p className="text-[13px] text-grey-2">{block.help}</p>}
      {locale !== "en" && !body.trim() && (
        <p className="text-[13px] text-grey-2">Empty: the site shows the English text in this language.</p>
      )}

      <div className={`grid grid-cols-1 gap-4 ${block.kind === "markdown" ? "nav:grid-cols-2" : ""}`}>
        <label htmlFor={id} className="sr-only">
          {`${block.label} (${locale.toUpperCase()})`}
        </label>
        {block.kind === "line" ? (
          <input id={id} lang={locale} value={body} onChange={(e) => setTexts({ ...texts, [locale]: e.target.value })} className="field" />
        ) : (
          <textarea
            id={id}
            lang={locale}
            rows={Math.min(18, Math.max(5, Math.ceil(body.length / 70) + body.split("\n").length))}
            value={body}
            onChange={(e) => setTexts({ ...texts, [locale]: e.target.value })}
            className="field font-mono text-[14px]"
            aria-describedby={`${id}-syntax`}
          />
        )}
        {block.kind === "markdown" && (
          <div className="flex flex-col gap-2">
            <p className="field-label" aria-hidden>
              Preview
            </p>
            <div lang={locale} className="rounded border border-dashed border-line p-4 text-grey-1">
              {body.trim() ? <Markdown text={body} small /> : <p className="text-[14px] text-grey-2">Nothing yet.</p>}
            </div>
          </div>
        )}
      </div>
      {block.kind === "markdown" && (
        <p id={`${id}-syntax`} className="text-[12px] text-grey-2">
          Blank line for a new paragraph · “- ” starts a bullet · **bold** · *italic* · [link](https://…)
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="button" onClick={save} disabled={pending || !dirty}>
          {pending ? "Saving…" : `Save ${locale.toUpperCase()}`}
        </button>
        {dirty && (
          <button type="button" className="button-quiet" onClick={() => setTexts({ ...texts, [locale]: saved[locale] })}>
            Undo changes
          </button>
        )}
        <Status result={status} />
      </div>
    </section>
  );
}
