import type { Metadata } from "next";
import { AdminTitle } from "@/components/admin/AdminTitle";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getAllSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Settings" };

export default async function Settings() {
  // The private settings (phone, date of birth) are shown here, to Samuel only.
  const s = await getAllSettings();
  return (
    <>
      <AdminTitle eyebrow="Settings" title="Settings">
        <p>Saving updates every page. The phone number and date of birth are stored only in the database.</p>
      </AdminTitle>
      <SettingsForm
        initial={{
          email: s.email,
          phone: s.phone,
          dateOfBirth: s.dateOfBirth,
          handicap: s.handicap,
          lowestHandicap: s.lowestHandicap,
          heightCm: s.heightCm === null ? "" : String(s.heightCm),
          wingspanCm: s.wingspanCm === null ? "" : String(s.wingspanCm),
          seasonStart: s.seasonStart,
          social: s.social,
          features: s.features,
        }}
      />
    </>
  );
}
