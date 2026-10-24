import { useTranslations } from "next-intl";
import type { Checked } from "@/content/types";
import { Md } from "./Md";

/**
 * A value from the page text that may still be unconfirmed. Facts marked
 * "check" get a small dashed tag; missing values get a visible placeholder.
 * Both disappear once Samuel confirms the value in admin (phase 3).
 */
export function Fact({ fact }: { fact: Checked }) {
  const t = useTranslations("pending");
  if (fact.value === null) {
    return <Pending label={fact.check ? t("toConfirm") : t("toFollow")} />;
  }
  return (
    <>
      <Md text={fact.value} />
      {fact.check && (
        <>
          {" "}
          <Pending label={t("check")} />
        </>
      )}
    </>
  );
}

export function Pending({ label }: { label: string }) {
  return (
    <span className="inline-block rounded-sm border border-dashed border-grey-3 px-1.5 align-[0.1em] text-[11px] leading-[1.6] font-medium tracking-[0.08em] whitespace-nowrap text-grey-2 uppercase">
      {label}
    </span>
  );
}
