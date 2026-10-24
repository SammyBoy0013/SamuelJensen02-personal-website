import { monogramMarkup } from "./markup";

/** SGJ header logo with a pink G; S and J take `currentColor`. */
export function Monogram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 48"
      width={78}
      height={32}
      className={className}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: monogramMarkup }}
    />
  );
}
