"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/admin/actions";
import { deleteSession, setSessionVisible } from "@/lib/admin/training-actions";
import { formatClock, formatKilometres, formatSessionDate, formatSplit } from "@/lib/training/format";
import { attempt, Status } from "./fields";

export type AdminSession = {
  id: number;
  startTime: string;
  title: string | null;
  sport: string;
  source: string;
  durationS: number;
  distanceM: number | null;
  avgSplitSPer500: number | null;
  visible: boolean;
  autoHiddenReason: string | null;
};

/** Stored sessions with a show/hide switch each (specification 5.6: Samuel can override). */
export function TrainingSessions({ sessions }: { sessions: AdminSession[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<number | null>(null);
  // The switch moves at once; the server's answer then replaces it.
  const [shown, setShown] = useState<Record<number, boolean>>({});
  const [prevSessions, setPrevSessions] = useState(sessions);
  if (sessions !== prevSessions) {
    setPrevSessions(sessions);
    setShown({});
  }

  const run = (id: number, action: () => Promise<ActionResult>) => {
    setStatus(null);
    setBusy(id);
    startTransition(async () => {
      setStatus(await attempt(action));
      setBusy(null);
      router.refresh();
    });
  };

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Status result={status} />
      <div className="relative max-w-full overflow-x-auto rounded border border-line bg-white">
        <table className="w-full border-collapse text-left text-[14px]">
          <caption className="sr-only">Stored training sessions, newest first</caption>
          <thead>
            <tr className="border-b border-line">
              {["On site", "Date", "Title", "Type", "Duration", "Distance", "Split", "Source", ""].map((h, i) => (
                <th key={i} scope="col" className="field-label px-3 py-2.5 font-medium whitespace-nowrap">
                  {h || <span className="sr-only">Actions</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-grey-2">
                  No sessions here yet.
                </td>
              </tr>
            )}
            {sessions.map((session) => {
              const s = { ...session, visible: shown[session.id] ?? session.visible };
              return (
              <tr key={s.id} className={`border-b border-line align-top last:border-b-0 ${s.visible ? "" : "bg-paper text-grey-2"}`}>
                <td className="px-3 py-2">
                  <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={s.visible}
                      disabled={pending && busy === s.id}
                      onChange={(e) => {
                        const visible = e.target.checked;
                        setShown((current) => ({ ...current, [s.id]: visible }));
                        run(s.id, () => setSessionVisible(s.id, visible));
                      }}
                      className="size-4 accent-[var(--pink)]"
                    />
                    <span className="sr-only">Show {s.title ?? "session"} of {formatSessionDate(s.startTime)} on the site</span>
                    <span aria-hidden>{s.visible ? "Shown" : "Hidden"}</span>
                  </label>
                  {!s.visible && s.autoHiddenReason && (
                    <span className="block text-[12px] text-grey-2">{s.autoHiddenReason}</span>
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{formatSessionDate(s.startTime)}</td>
                <td className="px-3 py-2">{s.title ?? "—"}</td>
                <td className="px-3 py-2">{s.sport}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatClock(s.durationS)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatKilometres(s.distanceM) ?? "—"}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatSplit(s.avgSplitSPer500) ?? "—"}</td>
                <td className="px-3 py-2">{s.source}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    className="button-quiet"
                    disabled={pending && busy === s.id}
                    onClick={() => {
                      if (window.confirm(`Delete this session (${formatSessionDate(s.startTime)})? A new upload can bring it back.`)) {
                        run(s.id, () => deleteSession(s.id));
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
