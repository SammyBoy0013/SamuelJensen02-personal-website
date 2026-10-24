"use client";

import { useState, type ReactNode } from "react";
import { Table } from "@/components/ui/Table";

type Props = {
  caption: string;
  headers: string[];
  rows: ReactNode[][];
  /** Rows shown before "All results" is pressed. */
  limit: number;
  showAll: string;
  showFewer: string;
};

/** Results table showing the latest `limit` rows; "All results" expands it (specification 5.5). */
export function ExpandableResults({ caption, headers, rows, limit, showAll, showFewer }: Props) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? rows : rows.slice(0, limit);

  return (
    <div className="flex flex-col items-start gap-6">
      <div id="results-table" className="w-full">
        <Table caption={caption} headers={headers} rows={visible} placing minWidth={720} />
      </div>
      {rows.length > limit && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls="results-table"
          onClick={() => setExpanded((e) => !e)}
          className="text-link cursor-pointer text-ink"
        >
          {expanded ? showFewer : showAll} <span aria-hidden>{expanded ? "↑" : "↓"}</span>
        </button>
      )}
    </div>
  );
}
