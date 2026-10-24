"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteListRow, reorderList, saveListRow, type ActionResult } from "@/lib/admin/actions";
import type { Field, ListDef } from "@/lib/admin/lists";
import { fieldErrors, rowSchema, toFormValues, type FormValues, type LocaleCode } from "@/lib/admin/validation";
import { formatDuration, formatRaceTime } from "@/lib/format";
import { attempt, FieldShell, LocalisedInput, Status, Toggle } from "./fields";

type Row = Record<string, unknown> & { id: number; checkFields?: string[] };

/** One cell of the list: the English text, a formatted time, and so on. */
function summarise(field: Field, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  switch (field.type) {
    case "localised":
      return (value as { en?: string }).en || "—";
    case "bool":
      return value ? "Yes" : "No";
    case "crew":
      return (value as string[]).join(", ") || "—";
    case "duration":
      return formatDuration(value as number) ?? "—";
    case "raceTime":
      return formatRaceTime(value as number) ?? "—";
    default:
      return String(value);
  }
}

/**
 * Add, edit, delete and drag to reorder the rows of one list (specification
 * section 6). The arrow buttons do the same as dragging, for the keyboard.
 */
export function ListEditor({ def, rows }: { def: ListDef; rows: Row[] }) {
  const router = useRouter();
  const [items, setItems] = useState(rows);
  const [prevRows, setPrevRows] = useState(rows);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  // Fresh rows from the server after a save replace the local copy.
  if (rows !== prevRows) {
    setPrevRows(rows);
    setItems(rows);
  }

  const summaryFields = def.summary.map((name) => def.fields.find((f) => f.name === name)!).filter(Boolean);

  const saveOrder = (next: Row[]) => {
    setItems(next);
    setStatus(null);
    startTransition(async () => {
      const result = await attempt(() => reorderList(def.slug, next.map((r) => r.id)));
      setStatus(result);
      router.refresh();
    });
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [row] = next.splice(from, 1);
    next.splice(to, 0, row);
    return next;
  };

  const remove = (row: Row) => {
    const name = summarise(summaryFields[0], row[summaryFields[0].name]);
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setStatus(null);
    startTransition(async () => {
      setStatus(await attempt(() => deleteListRow(def.slug, row.id)));
      setEditing(null);
      router.refresh();
    });
  };

  const onSaved = (result: ActionResult) => {
    setStatus(result);
    if (result.ok) {
      setEditing(null);
      router.refresh();
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Status result={status} />
        <button
          type="button"
          className="button"
          onClick={() => {
            setStatus(null);
            setEditing("new");
          }}
          disabled={editing === "new"}
        >
          + Add
        </button>
      </div>

      {/* Above the list rather than inside it, so the form fits a phone screen. */}
      {editing !== null && (
        <RowForm
          key={editing}
          def={def}
          row={editing === "new" ? null : (items.find((r) => r.id === editing) ?? null)}
          onCancel={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}

      <div className="relative max-w-full overflow-x-auto rounded border border-line bg-white">
        <table className="w-full border-collapse text-left text-[14px]">
          <caption className="sr-only">{def.label}</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="w-[92px] px-3 py-3">
                <span className="sr-only">Order</span>
              </th>
              {summaryFields.map((f) => (
                <th key={f.name} scope="col" className="field-label px-3 py-3 font-medium">
                  {f.label}
                </th>
              ))}
              <th scope="col" className="px-3 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={summaryFields.length + 2} className="px-3 py-6 text-grey-2">
                  Nothing here yet. Press Add to create the first row.
                </td>
              </tr>
            )}
            {items.map((row, index) => (
              <EditableRow
                key={row.id}
                row={row}
                index={index}
                count={items.length}
                fields={summaryFields}
                editing={editing === row.id}
                dragging={dragIndex === index}
                disabled={pending}
                onEdit={() => {
                  setStatus(null);
                  setEditing(editing === row.id ? null : row.id);
                }}
                onDelete={() => remove(row)}
                onMove={(to) => {
                  const next = move(index, to);
                  if (next) saveOrder(next);
                }}
                onDragStart={() => setDragIndex(index)}
                onDragEnter={() => {
                  if (dragIndex === null || dragIndex === index) return;
                  const next = move(dragIndex, index);
                  if (next) {
                    setItems(next);
                    setDragIndex(index);
                  }
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  if (items.some((r, i) => r.id !== rows[i]?.id)) saveOrder(items);
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditableRow({
  row,
  index,
  count,
  fields,
  editing,
  dragging,
  disabled,
  onEdit,
  onDelete,
  onMove,
  onDragStart,
  onDragEnter,
  onDragEnd,
}: {
  row: Row;
  index: number;
  count: number;
  fields: Field[];
  editing: boolean;
  dragging: boolean;
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (to: number) => void;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
}) {
  const checks = row.checkFields?.length ?? 0;
  return (
    <>
      <tr
        draggable={!editing}
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          onDragStart();
        }}
        onDragEnter={onDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragEnd={onDragEnd}
        className={`border-b border-line align-top last:border-b-0 ${dragging ? "bg-pink/10" : ""} ${editing ? "bg-paper" : ""}`}
      >
        <td className="px-3 py-3 whitespace-nowrap">
          <span aria-hidden title="Drag to reorder" className="mr-1 inline-block cursor-grab text-grey-3 select-none">
            ⋮⋮
          </span>
          <button
            type="button"
            onClick={() => onMove(index - 1)}
            disabled={disabled || index === 0}
            aria-label={`Move row ${index + 1} up`}
            className="cursor-pointer px-1 text-grey-2 hover:text-pink-text disabled:cursor-default disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(index + 1)}
            disabled={disabled || index === count - 1}
            aria-label={`Move row ${index + 1} down`}
            className="cursor-pointer px-1 text-grey-2 hover:text-pink-text disabled:cursor-default disabled:opacity-30"
          >
            ↓
          </button>
        </td>
        {fields.map((f, i) => (
          <td key={f.name} className={`px-3 py-3 ${i === 0 ? "text-ink" : "text-grey-1"}`}>
            {summarise(f, row[f.name])}
            {i === 0 && checks > 0 && (
              <span className="ml-2 rounded-sm border border-dashed border-grey-3 px-1.5 text-[11px] text-grey-2 uppercase">
                check
              </span>
            )}
          </td>
        ))}
        <td className="px-3 py-3 text-right whitespace-nowrap">
          <button type="button" className="button-quiet" onClick={onEdit} aria-pressed={editing}>
            {editing ? "Editing" : "Edit"}
          </button>{" "}
          <button type="button" className="button-quiet" onClick={onDelete} disabled={disabled}>
            Delete
          </button>
        </td>
      </tr>
    </>
  );
}

function RowForm({
  def,
  row,
  onCancel,
  onSaved,
}: {
  def: ListDef;
  row: Row | null;
  onCancel: () => void;
  onSaved: (result: ActionResult) => void;
}) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(def, row));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const formId = `${def.slug}-${row?.id ?? "new"}`;
  const formRef = useRef<HTMLFormElement>(null);
  // Bring the form into view when it opens (the row may be far down the list).
  useEffect(() => {
    formRef.current?.scrollIntoView({ block: "nearest" });
  }, []);
  const checkFields = (values.checkFields as string[] | undefined) ?? [];
  // Longer texts get a text area. Decided once, so the field never swaps while typing.
  const [longFields] = useState(
    () =>
      new Set(
        def.fields
          .filter((f) => f.type === "localised" && (f.name === "text" || (values[f.name] as { en: string }).en.length > 60))
          .map((f) => f.name),
      ),
  );

  const set = (name: string, value: FormValues[string]) => setValues((v) => ({ ...v, [name]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // The same zod schema the server uses, for instant feedback.
    const parsed = rowSchema(def).safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      setStatus({ ok: false, message: "Please fix the highlighted fields." });
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = await attempt(() => saveListRow(def.slug, row?.id ?? null, values));
      if (!result.ok) {
        setErrors(result.errors ?? {});
        setStatus(result);
      }
      onSaved(result);
    });
  };

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      noValidate
      className="mt-4 flex flex-col gap-5 rounded border border-line bg-white p-5">
      <p className="font-serif text-[22px] font-semibold text-ink">{row ? `Edit: ${summarise(def.fields.find((f) => f.name === def.summary[0])!, row[def.summary[0]])}` : `New row: ${def.label}`}</p>
      <div className="grid grid-cols-1 gap-5 nav:grid-cols-2">
        {def.fields.map((field) => {
          const id = `${formId}-${field.name}`;
          const error = errors[field.name];
          const describedBy = [field.help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
          const label = `${field.label}${field.required ? " *" : ""}`;
          const value = values[field.name];
          if (field.type === "bool") {
            return (
              <div key={field.name} className="flex items-end">
                <Toggle label={field.label} checked={Boolean(value)} onChange={(v) => set(field.name, v)} help={field.help} />
              </div>
            );
          }
          return (
            <div key={field.name} className={field.type === "localised" || field.type === "crew" ? "nav:col-span-2" : ""}>
              <FieldShell id={id} label={label} help={field.help} error={error}>
                {field.type === "localised" ? (
                  <LocalisedInput
                    id={id}
                    value={value as Record<LocaleCode, string>}
                    onChange={(v) => set(field.name, v)}
                    multiline={longFields.has(field.name)}
                    invalid={Boolean(error)}
                    describedBy={describedBy}
                  />
                ) : (
                  <input
                    id={id}
                    type={field.type === "date" ? "date" : "text"}
                    inputMode={field.type === "int" || field.type === "real" ? "decimal" : undefined}
                    value={value as string}
                    onChange={(e) => set(field.name, e.target.value)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={describedBy}
                    className="field"
                  />
                )}
              </FieldShell>
              {field.checkable && (
                <div className="mt-2">
                  <Toggle
                    label="Still to confirm (shows a “check” tag on the site)"
                    checked={checkFields.includes(field.name)}
                    onChange={(on) =>
                      set(
                        "checkFields",
                        on ? [...checkFields, field.name] : checkFields.filter((name) => name !== field.name),
                      )
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="button" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </button>
        <button type="button" className="button-quiet" onClick={onCancel}>
          Cancel
        </button>
        <Status result={status} />
      </div>
    </form>
  );
}
