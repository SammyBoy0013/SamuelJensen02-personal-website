import { AdminTitle } from "@/components/admin/AdminTitle";
import { Link } from "@/i18n/navigation";
import { adminNav } from "@/lib/admin/nav";

export default function AdminHome() {
  return (
    <>
      <AdminTitle title="Welcome back, Samuel">
        <p>
          Choose what to edit. Every save updates the public pages in all three languages straight away. Danish and
          French fields can stay empty: the site shows the English until a translation is added.
        </p>
      </AdminTitle>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 nav:grid-cols-3">
        {adminNav.map((group) => (
          <li key={group.label} className="flex flex-col gap-3 rounded border border-line bg-white p-5">
            <h2 className="font-serif text-[24px] font-semibold text-ink">{group.label}</h2>
            <ul className="flex flex-col gap-1">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[15px] underline decoration-pink decoration-2 underline-offset-4 hover:text-pink-text">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
}
