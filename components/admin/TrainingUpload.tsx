"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/admin/actions";
import { importTraining, previewTraining } from "@/lib/admin/training-actions";
import { formatClock, formatKilometres, formatSessionDate } from "@/lib/training/format";
import { ACCEPTED, MAX_IMPORT_BYTES, parseTrainingFile } from "@/lib/training/parse";
import type { ParsedSession, PreviewRow } from "@/lib/training/types";
import { FieldShell, Status } from "./fields";

/** Matches BATCH_SIZE in lib/training/import.ts: larger uploads go in parts. */
const BATCH = 2000;
const SHOWN = 300;

type FileSummary = { name: string; format: string; count: number; warnings: string[] };
type Preview = { sessions: ParsedSession[]; rows: PreviewRow[]; files: FileSummary[] };

const statusLabel: Record<PreviewRow["status"], string> = {
  new: "New",
  duplicate: "Duplicate (skipped)",
  "auto-hidden": "New, hidden",
};

async function inBatches<T>(sessions: ParsedSession[], run: (batch: ParsedSession[]) => Promise<T>): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < sessions.length; i += BATCH) results.push(await run(sessions.slice(i, i + BATCH)));
  return results;
}

/**
 * Upload flow (specification 5.6): choose files, see a preview of what is
 * new, duplicate or hidden, then confirm. Files are read here in the browser;
 * only summary figures are sent, so routes and positions never leave the device.
 */
export function TrainingUpload() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [status, setStatus] = useState<ActionResult | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [pending, startTransition] = useTransition();

  const read = () => {
    setStatus(null);
    setPreview(null);
    startTransition(async () => {
      const summaries: FileSummary[] = [];
      const sessions: ParsedSession[] = [];
      for (const file of files) {
        if (file.size > MAX_IMPORT_BYTES) {
          summaries.push({ name: file.name, format: "Too large", count: 0, warnings: ["Files must be under 50 MB."] });
          continue;
        }
        try {
          const result = await parseTrainingFile(file.name, await file.arrayBuffer());
          summaries.push({ name: file.name, format: result.format, count: result.sessions.length, warnings: result.warnings });
          sessions.push(...result.sessions);
        } catch {
          summaries.push({ name: file.name, format: "Unreadable", count: 0, warnings: ["This file could not be read."] });
        }
      }
      sessions.sort((a, b) => Date.parse(b.startTime) - Date.parse(a.startTime));
      if (sessions.length === 0) {
        setPreview({ sessions, rows: [], files: summaries });
        setStatus({ ok: false, message: "No sessions found in these files." });
        return;
      }
      const results = await inBatches(sessions, (batch) =>
        previewTraining(batch).catch(() => ({ ok: false as const, message: "The preview failed. Try again." })),
      );
      const failed = results.find((r) => !r.ok);
      if (failed && !failed.ok) {
        setStatus({ ok: false, message: failed.message });
        return;
      }
      setPreview({ sessions, rows: results.flatMap((r) => (r.ok ? r.rows : [])), files: summaries });
    });
  };

  const confirm = () => {
    if (!preview) return;
    startTransition(async () => {
      const results = await inBatches(preview.sessions, (batch) =>
        importTraining(batch).catch(() => ({
          ok: false as const,
          message: "The import did not finish. Check your connection and try again: sessions already saved are skipped.",
        })),
      );
      const failed = results.find((r) => !r.ok);
      if (failed) {
        setStatus(failed);
        return;
      }
      const sum = (key: "added" | "hidden" | "duplicates") =>
        results.reduce((total, r) => total + ("added" in r ? (r[key] ?? 0) : 0), 0);
      setStatus({
        ok: true,
        message: `Imported ${sum("added")} sessions (${sum("hidden")} hidden). ${sum("duplicates")} duplicates skipped.`,
      });
      setPreview(null);
      setFiles([]);
      setResetKey((k) => k + 1);
      router.refresh();
    });
  };

  const counts = preview
    ? {
        new: preview.rows.filter((r) => r.status === "new").length,
        hidden: preview.rows.filter((r) => r.status === "auto-hidden").length,
        duplicate: preview.rows.filter((r) => r.status === "duplicate").length,
      }
    : null;
  const toImport = counts ? counts.new + counts.hidden : 0;
  const rows = preview?.sessions.map((s, i) => ({ s, row: preview.rows[i] })) ?? [];

  return (
    <section aria-labelledby="upload-title" className="flex flex-col gap-5 rounded border border-line bg-white p-5 nav:p-6">
      <h2 id="upload-title" className="font-serif text-[28px] font-semibold text-ink">
        Upload training files
      </h2>
      <ul className="flex flex-col gap-1 text-[14px] text-grey-1">
        <li>
          <strong className="font-medium text-ink">Strava, everything:</strong> the zip from Settings → My Account →
          Download or delete your account, or just the activities.csv inside it.
        </li>
        <li>
          <strong className="font-medium text-ink">Strava, one activity:</strong> a .fit, .gpx or .tcx file.
        </li>
        <li>
          <strong className="font-medium text-ink">Concept2:</strong> the season CSV from log.concept2.com → History.
        </li>
        <li>
          <strong className="font-medium text-ink">NK SpeedCoach:</strong> the session CSV from NK LiNK Logbook.
        </li>
      </ul>
      <p className="text-[14px] text-grey-2">
        Files are read in your browser, up to 50 MB each. Only the summary of each session (time, duration, distance,
        split, rate, heart rate and power) is sent; routes and positions never leave your computer.
      </p>

      <FieldShell id="training-files" label="Files">
        <input
          key={resetKey}
          id="training-files"
          type="file"
          multiple
          accept={ACCEPTED}
          onChange={(e) => {
            setFiles(Array.from(e.target.files ?? []));
            setPreview(null);
            setStatus(null);
          }}
          className="text-[14px]"
        />
      </FieldShell>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="button" onClick={read} disabled={pending || files.length === 0}>
          {pending && !preview ? "Reading…" : "Preview"}
        </button>
        <Status result={status} />
      </div>

      {preview && counts && (
        <div className="flex flex-col gap-4 border-t border-line pt-5">
          <ul className="flex flex-col gap-1 text-[14px]">
            {preview.files.map((f) => (
              <li key={f.name}>
                <span className="text-ink">{f.name}</span>: {f.format}, {f.count} {f.count === 1 ? "session" : "sessions"}
                {f.warnings.length > 0 && (
                  <ul className="pl-4 text-pink-text">
                    {f.warnings.slice(0, 5).map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                    {f.warnings.length > 5 && <li>and {f.warnings.length - 5} more</li>}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          <p className="text-[16px] text-ink">
            <strong className="font-semibold">{counts.new}</strong> new ·{" "}
            <strong className="font-semibold">{counts.hidden}</strong> new but hidden (likely warm-ups or cool-downs) ·{" "}
            <strong className="font-semibold">{counts.duplicate}</strong> duplicates, skipped
          </p>

          {rows.length > 0 && (
            <div className="relative max-w-full overflow-x-auto rounded border border-line">
              <table className="w-full border-collapse text-left text-[14px]">
                <caption className="sr-only">Import preview</caption>
                <thead>
                  <tr className="border-b border-line">
                    {["Status", "Date", "Title", "Type", "Duration", "Distance", "Source"].map((h) => (
                      <th key={h} scope="col" className="field-label px-3 py-2.5 font-medium whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(showAll ? rows : rows.slice(0, SHOWN)).map(({ s, row }, i) => (
                    <tr key={i} className={`border-b border-line align-top last:border-b-0 ${row.status === "duplicate" ? "text-grey-2" : ""}`}>
                      <td className="px-3 py-2">
                        <span className={row.status === "new" ? "font-medium text-ink" : ""}>{statusLabel[row.status]}</span>
                        {row.reason && <span className="block text-[12px] text-grey-2">{row.reason}</span>}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatSessionDate(s.startTime)}</td>
                      <td className="px-3 py-2">{s.title ?? "—"}</td>
                      <td className="px-3 py-2">{s.sport}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatClock(s.durationS)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatKilometres(s.distanceM) ?? "—"}</td>
                      <td className="px-3 py-2">{s.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {rows.length > SHOWN && !showAll && (
            <button type="button" className="button-quiet self-start" onClick={() => setShowAll(true)}>
              Show all {rows.length} rows
            </button>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="button" onClick={confirm} disabled={pending || toImport === 0}>
              {pending ? "Importing…" : `Import ${toImport} ${toImport === 1 ? "session" : "sessions"}`}
            </button>
            <button type="button" className="button-quiet" onClick={() => setPreview(null)} disabled={pending}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
