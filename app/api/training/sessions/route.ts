import { getSessions } from "@/lib/training/summary";

/**
 * Further pages of the public session list on the Rowing page. Visible
 * sessions only, summary figures only (lib/training/summary.ts).
 */
export async function GET(request: Request) {
  const page = Number(new URL(request.url).searchParams.get("page")) || 1;
  const result = await getSessions({ page });
  return Response.json(result, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
  });
}
