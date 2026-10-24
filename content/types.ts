// Shapes shared by the phase 2 content files. Phase 3 moves this content into
// the database; the field names follow docs/03-technical-setup.md where they can.
//
// Text fields use inline Markdown: **bold** and *italic*.

/**
 * A fact from the page text. `check: true` marks one the text flags "check"
 * (still to confirm); `value: null` means it is missing.
 */
export type Checked = { value: string | null; check?: boolean };
