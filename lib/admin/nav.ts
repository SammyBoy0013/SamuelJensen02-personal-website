import { lists } from "./lists";

export type AdminLink = { href: string; label: string };
export type AdminGroup = { label: string; links: AdminLink[] };

const listLinks = (group: string): AdminLink[] =>
  lists.filter((l) => l.group === group).map((l) => ({ href: `/admin/lists/${l.slug}`, label: l.label }));

/** One section per row of the admin table in specification section 6. */
export const adminNav: AdminGroup[] = [
  { label: "Pages", links: [{ href: "/admin/pages", label: "Page text" }] },
  { label: "Rowing", links: listLinks("Rowing") },
  { label: "Training log", links: [{ href: "/admin/training", label: "Uploads" }] },
  { label: "Golf", links: listLinks("Golf") },
  { label: "About", links: listLinks("About") },
  {
    label: "Engineering",
    links: [...listLinks("Engineering"), { href: "/admin/photos/project", label: "Project photos" }],
  },
  { label: "Gallery", links: [{ href: "/admin/photos/gallery", label: "Photos" }] },
  { label: "CV", links: listLinks("CV") },
  { label: "Settings", links: [{ href: "/admin/settings", label: "Settings" }] },
];
