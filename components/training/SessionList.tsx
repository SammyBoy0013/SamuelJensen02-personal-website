"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Table } from "@/components/ui/Table";
import { formatClock, formatKilometres, formatSessionDate, formatSplit } from "@/lib/training/format";
import type { SessionPage } from "@/lib/training/summary";

/**
 * The public session list, newest first. The first page is part of the
 * static Rowing page; older pages load from /api/training/sessions.
 */
export function SessionList({ initial, locale }: { initial: SessionPage; locale: string }) {
  const t = useTranslations("rowing.training");
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const go = async (page: number) => {
    setLoading(true);
    setFailed(false);
    try {
      const response = await fetch(`/api/training/sessions?page=${page}`);
      if (!response.ok) throw new Error(String(response.status));
      setData(await response.json());
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  if (data.total === 0) return <p className="text-[17px]">{t("none")}</p>;

  return (
    <div className="flex flex-col gap-4" aria-busy={loading}>
      <Table
        caption={t("listCaption")}
        headers={[t("date"), t("type"), t("duration"), t("distance"), t("split"), t("rate"), t("heartRate")]}
        rows={data.sessions.map((s) => [
          formatSessionDate(s.startTime, locale),
          t(`types.${s.sport}`),
          formatClock(s.durationS),
          formatKilometres(s.distanceM, locale) ?? "—",
          formatSplit(s.avgSplitSPer500) ?? "—",
          s.avgRate !== null ? String(Math.round(s.avgRate)) : "—",
          s.avgHr !== null ? `${s.avgHr} bpm` : "—",
        ])}
      />
      {data.pageCount > 1 && (
        <nav aria-label={t("listHeading")} className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <button
            type="button"
            onClick={() => go(data.page - 1)}
            disabled={loading || data.page <= 1}
            className="text-link cursor-pointer text-ink disabled:cursor-default disabled:opacity-40"
          >
            <span aria-hidden>←</span> {t("newer")}
          </button>
          <span aria-live="polite" className="text-[14px] text-grey-2">
            {t("pageOf", { page: data.page, pageCount: data.pageCount })}
          </span>
          <button
            type="button"
            onClick={() => go(data.page + 1)}
            disabled={loading || data.page >= data.pageCount}
            className="text-link cursor-pointer text-ink disabled:cursor-default disabled:opacity-40"
          >
            {t("older")} <span aria-hidden>→</span>
          </button>
        </nav>
      )}
      {failed && (
        <p role="alert" className="text-[14px] text-pink-text">
          {t("loadFailed")}
        </p>
      )}
    </div>
  );
}
