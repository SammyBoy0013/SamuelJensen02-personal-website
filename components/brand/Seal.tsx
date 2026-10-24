import { sealMarkup } from "./markup";

/** The official seal. Ring, text and S/J take `currentColor`; G, dots and underline stay pink. */
export function Seal({ className, label }: { className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 600 600"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: sealMarkup }}
    />
  );
}
