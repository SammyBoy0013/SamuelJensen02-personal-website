import type { Metadata } from "next";
import { AdminTitle } from "@/components/admin/AdminTitle";

export const metadata: Metadata = { title: "Training log" };

// The importers come in phase 4 (docs/prompts/phase-4.md); the table already exists.
export default function Training() {
  return (
    <>
      <AdminTitle eyebrow="Training log" title="Uploads">
        <p>
          Uploading Strava, Concept2 and NK SpeedCoach files, with an import preview and per-session visibility, arrives
          in the next phase.
        </p>
      </AdminTitle>
      <p className="rounded border-[1.5px] border-dashed border-grey-3 px-5 py-4 text-[15px] text-grey-1">
        Coming in phase 4.
      </p>
    </>
  );
}
