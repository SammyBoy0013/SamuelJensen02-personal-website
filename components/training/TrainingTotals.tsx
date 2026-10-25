import { useTranslations } from "next-intl";
import { CountUp } from "@/components/ui/CountUp";
import type { TrainingSummary } from "@/lib/training/summary";

/**
 * This week, this month and this season as statistic cards. These are summary
 * statistics, so they count up; tables never do (specification 5.2).
 */
export function TrainingTotals({ summary }: { summary: TrainingSummary }) {
  const r = useTranslations("rowing");
  const periods = [
    ["thisWeek", summary.week],
    ["thisMonth", summary.month],
    ["thisSeason", summary.season],
  ] as const;

  return (
    <div
      role="group"
      aria-label={r("training.summaryCaption")}
      className="grid grid-cols-1 gap-px overflow-hidden rounded border border-line bg-line nav:grid-cols-3"
    >
      {periods.map(([period, totals]) => (
        <section key={period} aria-label={r(period)} className="flex flex-col gap-4 bg-white px-5 py-6 nav:px-7">
          <h3 className="eyebrow text-[12px] text-grey-2">{r(period)}</h3>
          <dl className="grid grid-cols-3 gap-3">
            {[
              { label: r("sessions"), value: <CountUp value={totals.sessions} /> },
              { label: r("hours"), value: <CountUp value={totals.hours} decimals={1} /> },
              { label: r("kilometres"), value: <CountUp value={totals.kilometres} decimals={1} /> },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse gap-1">
                <dt className="text-[13px] text-grey-2">{stat.label}</dt>
                <dd className="font-serif text-[clamp(28px,3vw,40px)] leading-none font-semibold whitespace-nowrap text-ink">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
