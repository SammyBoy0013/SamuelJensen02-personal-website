import type { ReactNode } from "react";

const columns: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-2 nav:grid-cols-4",
};

/** Row of statistic tiles: white cards with 1 px `--line` gaps (design system). */
export function StatTiles({
  tiles,
  compact,
}: {
  tiles: { label: string; value: ReactNode; note?: ReactNode }[];
  /** Smaller numbers, for tiles in a narrow column. */
  compact?: boolean;
}) {
  return (
    <dl className={`grid gap-px overflow-hidden rounded border border-line bg-line ${columns[tiles.length] ?? "grid-cols-2"}`}>
      {tiles.map((tile) => (
        <div key={tile.label} className={`flex flex-col gap-2 bg-white px-5 py-6 ${compact ? "" : "nav:px-7"}`}>
          <dt className="eyebrow text-[12px] text-grey-2">{tile.label}</dt>
          <dd
            className={`font-serif leading-none font-semibold whitespace-nowrap text-ink ${compact ? "text-[40px]" : "text-[40px] nav:text-[48px]"}`}
          >
            {tile.value}
          </dd>
          {tile.note && <dd className="text-[14px] leading-snug text-grey-2">{tile.note}</dd>}
        </div>
      ))}
    </dl>
  );
}
