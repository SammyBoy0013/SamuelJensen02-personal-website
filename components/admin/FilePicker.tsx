"use client";

/**
 * A clear "Choose files" button in place of the browser's own file box, with
 * the chosen names beside it. The real input stays in the page (visually
 * hidden) so the keyboard, screen readers and the field's label still work.
 */
export function FilePicker({
  id,
  buttonLabel,
  multiple = false,
  accept,
  chosen,
  onChange,
}: {
  id: string;
  buttonLabel: string;
  multiple?: boolean;
  accept?: string;
  /** Names of the chosen files, shown beside the button. */
  chosen: string[];
  onChange: (files: File[]) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        id={id}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={(e) => onChange(Array.from(e.target.files ?? []))}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className="button-quiet peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-pink"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />
        </svg>
        {buttonLabel}
      </label>
      <span className="min-w-0 text-[14px] break-words text-grey-2" aria-live="polite">
        {chosen.length === 0 ? "No file chosen" : chosen.length === 1 ? chosen[0] : `${chosen.length} files: ${chosen.join(", ")}`}
      </span>
    </div>
  );
}
