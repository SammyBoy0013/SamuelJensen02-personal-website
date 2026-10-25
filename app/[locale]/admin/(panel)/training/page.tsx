import type { Metadata } from "next";
import { count, desc, eq, type SQL } from "drizzle-orm";
import { AdminTitle } from "@/components/admin/AdminTitle";
import { TrainingSessions } from "@/components/admin/TrainingSessions";
import { TrainingUpload } from "@/components/admin/TrainingUpload";
import { db, schema } from "@/db";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = { title: "Training log" };

const PAGE_SIZE = 50;
const filters = { all: "All", shown: "Shown", hidden: "Hidden" } as const;
type Filter = keyof typeof filters;

export default async function Training({ searchParams }: PageProps<"/[locale]/admin/training">) {
  const query = await searchParams;
  const filter: Filter = query.show === "shown" || query.show === "hidden" ? query.show : "all";
  const t = schema.trainingSessions;
  const where: SQL | undefined = filter === "all" ? undefined : eq(t.visible, filter === "shown");

  const [{ total }] = await db.select({ total: count() }).from(t).where(where);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(query.page) || 1), pageCount);
  const rows = await db
    .select({
      id: t.id,
      startTime: t.startTime,
      title: t.title,
      sport: t.sport,
      source: t.source,
      durationS: t.durationS,
      distanceM: t.distanceM,
      avgSplitSPer500: t.avgSplitSPer500,
      visible: t.visible,
      autoHiddenReason: t.autoHiddenReason,
    })
    .from(t)
    .where(where)
    .orderBy(desc(t.startTime), desc(t.id))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const href = (next: { page?: number; show?: Filter }) => {
    const params = new URLSearchParams();
    const show = next.show ?? filter;
    if (show !== "all") params.set("show", show);
    if ((next.page ?? 1) > 1) params.set("page", String(next.page));
    const qs = params.toString();
    return `/admin/training${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <AdminTitle eyebrow="Training log" title="Training log">
        <p>
          Sessions under 12 minutes, or titled warm-up, cool-down, WU or CD, are hidden automatically. Switch any
          session on or off below; the Rowing page updates straight away.
        </p>
      </AdminTitle>

      <TrainingUpload />

      <section aria-labelledby="sessions-title" className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="sessions-title" className="font-serif text-[28px] font-semibold text-ink">
            Sessions ({total})
          </h2>
          <nav aria-label="Filter sessions" className="flex gap-2">
            {(Object.keys(filters) as Filter[]).map((f) => (
              <Link
                key={f}
                href={href({ show: f })}
                aria-current={f === filter ? "page" : undefined}
                className={f === filter ? "button" : "button-quiet"}
              >
                {filters[f]}
              </Link>
            ))}
          </nav>
        </div>
        <TrainingSessions sessions={rows.map((r) => ({ ...r, startTime: r.startTime.toISOString() }))} />
        {pageCount > 1 && (
          <nav aria-label="Pages" className="flex items-center gap-3 text-[14px]">
            {page > 1 && (
              <Link href={href({ page: page - 1 })} className="button-quiet">
                ← Newer
              </Link>
            )}
            <span className="text-grey-2">
              Page {page} of {pageCount}
            </span>
            {page < pageCount && (
              <Link href={href({ page: page + 1 })} className="button-quiet">
                Older →
              </Link>
            )}
          </nav>
        )}
      </section>
    </>
  );
}
