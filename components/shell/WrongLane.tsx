import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/** "Wrong lane": three lane boards reading 4 0 4, the 0 in pink. */
export function WrongLane() {
  const t = useTranslations("notFound");
  const boards = [
    { n: "4", pink: false },
    { n: "0", pink: true },
    { n: "4", pink: false },
  ];

  return (
    <>
      {/* Unknown routes are rendered in the browser, so set the title here too. */}
      <title>{`${t("title")} — Samuel Jensen`}</title>
      <section className="wrap flex min-h-svh flex-col items-center justify-center gap-10 pt-28 pb-20 text-center">
        <div aria-hidden className="flex gap-3 nav:gap-5">
          {boards.map((b, i) => (
            <div
              key={i}
              className="flex h-[clamp(150px,24vw,260px)] w-[clamp(84px,13vw,150px)] items-center justify-center rounded border border-line bg-white shadow-[0_10px_30px_rgba(22,19,26,0.08)]"
            >
              <span
                className={`font-serif text-[clamp(80px,13vw,150px)] leading-none font-semibold ${
                  b.pink ? "text-pink" : "text-ink"
                }`}
              >
                {b.n}
              </span>
            </div>
          ))}
        </div>
        <div className="flex max-w-xl flex-col items-center gap-4">
          <h1 className="page-title">{t("headline")}</h1>
          <p className="text-[18px] leading-[1.7]">{t("text")}</p>
          <Link href="/" className="text-link mt-2 text-ink">
            {t("button")} <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
