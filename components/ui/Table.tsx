import type { ReactNode } from "react";

type Props = {
  caption?: string;
  headers: string[];
  rows: ReactNode[][];
  /** Results tables: the last column is right-aligned, bold and pink. */
  placing?: boolean;
  /** Narrowest width before the table scrolls sideways on phones. */
  minWidth?: number;
};

/** Full-width table with 1 px row borders (design system "Results table"). */
export function Table({ caption, headers, rows, placing, minWidth = 0 }: Props) {
  return (
    <div className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] nav:mx-0 nav:px-0">
      <table className="w-full border-collapse text-left text-[15px] leading-[1.5]" style={{ minWidth }}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={h}
                scope="col"
                className={`border-b border-line pr-6 pb-3 text-[12px] font-medium tracking-[0.1em] text-grey-2 uppercase last:pr-0 ${
                  placing && i === headers.length - 1 ? "text-right" : ""
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, r) => (
            <tr key={r} className="border-b border-line align-top">
              {cells.map((cell, i) => {
                const last = i === cells.length - 1;
                return (
                  <td
                    key={i}
                    className={`py-4 pr-6 last:pr-0 ${i === 0 ? "whitespace-nowrap text-ink" : ""} ${
                      placing && last ? "text-right font-semibold text-pink-text" : ""
                    }`}
                  >
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Two-column "At a glance" table: label on the left, value on the right. */
export function GlanceTable({ caption, rows }: { caption: string; rows: [string, ReactNode][] }) {
  return (
    <table className="w-full border-collapse text-left text-[15px] leading-[1.5]">
      <caption className="sr-only">{caption}</caption>
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label} className="border-b border-line align-top first:border-t">
            <th
              scope="row"
              className="w-[38%] py-3.5 pr-6 text-[12px] font-medium tracking-[0.1em] text-grey-2 uppercase"
            >
              {label}
            </th>
            <td className="py-3.5 text-ink">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
