import { signIn } from "@/lib/auth";

/**
 * The unlisted sign-in link (bookmark /api/admin/sign-in). It goes straight to
 * GitHub; Auth.js refuses every account except ADMIN_GITHUB_ID.
 */
export async function GET() {
  await signIn("github", { redirectTo: "/en/admin" });
}
