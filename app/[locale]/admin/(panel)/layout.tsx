import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AdminNav } from "@/components/admin/AdminNav";
import { Monogram } from "@/components/brand/Monogram";
import { Link } from "@/i18n/navigation";
import { isAdmin, requireAdmin, signOut } from "@/lib/auth";

// Checked on every request: never prerendered or cached.
export const dynamic = "force-dynamic";

// Metadata is resolved even when the layout ends in a 404, so the admin
// titles are only given to the admin: everyone else sees "Wrong lane".
export async function generateMetadata(): Promise<Metadata> {
  const robots = { index: false, follow: false };
  if (!(await isAdmin())) return { robots };
  return { title: { default: "Admin", template: "%s — Admin" }, robots };
}

/** Every admin page: Samuel only. Anyone else gets the "Wrong lane" 404. */
export default async function AdminLayout({ children, params }: LayoutProps<"/[locale]/admin">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  return (
    <div className="min-h-svh bg-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/96 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4 px-[var(--gutter)] py-3">
          <div className="flex items-center gap-4">
            <Link href="/admin" aria-label="Admin home">
              <Monogram className="h-8 w-auto" />
            </Link>
            <span className="eyebrow">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="button-quiet">
              View site ↗
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/en" });
              }}
            >
              <button type="submit" className="button-quiet">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex flex-col nav:flex-row">
        <AdminNav />
        <main id="main" className="min-w-0 flex-1 px-[var(--gutter)] py-10 nav:py-14">
          <div className="mx-auto flex w-full max-w-[1100px] min-w-0 flex-col gap-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
