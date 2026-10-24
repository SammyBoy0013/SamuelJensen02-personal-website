// Admin sign-in (specification section 6): GitHub only, for one account.
// The account is matched on its numeric GitHub user ID (ADMIN_GITHUB_ID),
// which never changes, unlike a username. Nobody else gets a session, and
// every admin page and action checks the ID again (requireAdmin).

import "server-only";
import { notFound } from "next/navigation";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const adminId = () => process.env.ADMIN_GITHUB_ID?.trim() || null;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  // No database sessions: one signed, encrypted cookie (the admin session).
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  // A refused sign-in lands on /admin, which is a 404 for anyone but Samuel.
  pages: { signIn: "/en/admin", error: "/en/admin" },
  callbacks: {
    signIn({ account, profile }) {
      return account?.provider === "github" && profile?.id != null && String(profile.id) === adminId();
    },
    jwt({ token, profile }) {
      if (profile?.id != null) token.githubId = String(profile.id);
      return token;
    },
    session({ session, token }) {
      session.user.githubId = typeof token.githubId === "string" ? token.githubId : undefined;
      return session;
    },
  },
});

/** True when the visitor is signed in as the admin account. */
export async function isAdmin(): Promise<boolean> {
  const id = adminId();
  if (!id) return false;
  const session = await auth();
  return session?.user?.githubId === id;
}

/**
 * For every admin page and server action: anyone who is not the admin gets a
 * 404, never a 403, so the admin's existence is not confirmed.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) notFound();
}
