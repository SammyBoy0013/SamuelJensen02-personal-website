import { notFound } from "next/navigation";

// Any unknown path under a locale shows the "Wrong lane" page.
export default function CatchAll() {
  notFound();
}
