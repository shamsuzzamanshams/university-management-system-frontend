"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { request } from "@/lib/api";
import { Button } from "@/components/ui/button";

export type ResourceField = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "textarea" | "select" | "checkbox";
  required?: boolean;
  options?: { label: string; value: string }[];
  source?: string;
};
export type ResourceConfig = {
  title: string;
  description: string;
  endpoint: string;
  idField?: string;
  columns: { key: string; label: string }[];
  fields: ResourceField[];
  createEndpoint?: string;
  updateMethod?: "PATCH" | "PUT";
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
};

type Row = Record<string, unknown>;
function unwrapRows(value: unknown): Row[] {
  if (Array.isArray(value)) return value as Row[];
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["items", "results", "records", "data"]) {
      if (Array.isArray(record[key])) return record[key] as Row[];
    }
  }
  return [];
}
const display = (value: unknown) => {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};
const readColumn = (row: Row, key: string): unknown => key.split(".").reduce<unknown>((value, segment) => value && typeof value === "object" ? (value as Row)[segment] : undefined, row);

export function ResourceManager({ config }: { config: ResourceConfig }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [choices, setChoices] = useState<Record<string, Row[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const idField = config.idField ?? "id";

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [data, ...choiceData] = await Promise.all([
        request<unknown>(config.endpoint),
        ...Array.from(new Set(config.fields.flatMap((field) => field.source ? [field.source] : []))).map((source) => request<unknown>(source)),
      ]);
      setRows(unwrapRows(data));
      const sources = Array.from(new Set(config.fields.flatMap((field) => field.source ? [field.source] : [])));
      setChoices(Object.fromEntries(sources.map((source, index) => [source, unwrapRows(choiceData[index])] )));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load this data.");
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => { void load(); }, [load]);
  const visibleRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((row) => Object.values(row).some((value) => display(value).toLowerCase().includes(normalized)));
  }, [query, rows]);

  const beginCreate = () => {
    setEditing({});
    setForm(Object.fromEntries(config.fields.map((field) => [field.name, field.type === "checkbox" ? false : ""])));
  };
  const beginEdit = (row: Row) => {
    setEditing(row);
    setForm(Object.fromEntries(config.fields.map((field) => {
      const value = row[field.name];
      return [field.name, field.type === "date" && value ? String(value).slice(0, 10) : value ?? (field.type === "checkbox" ? false : "")];
    })));
  };
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    const isEdit = Boolean(editing[idField]);
    const payload = Object.fromEntries(config.fields.map((field) => {
      const value = form[field.name];
      if (field.type === "number" && value !== "") return [field.name, Number(value)];
      if (field.type === "checkbox") return [field.name, Boolean(value)];
      return [field.name, value];
    }));
    try {
      const id = editing[idField];
      await request(isEdit ? `${config.endpoint}/${encodeURIComponent(String(id))}` : (config.createEndpoint ?? config.endpoint), {
        method: isEdit ? (config.updateMethod ?? "PATCH") : "POST",
        body: JSON.stringify(payload),
      });
      setEditing(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };
  const remove = async (row: Row) => {
    const id = row[idField];
    if (!id || !window.confirm("Delete this record? This cannot be undone.")) return;
    setError("");
    try {
      await request(`${config.endpoint}/${encodeURIComponent(String(id))}`, { method: "DELETE" });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete this record.");
    }
  };

  return <>
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-3xl font-bold tracking-tight">{config.title}</h1><p className="mt-2 text-slate-600">{config.description}</p></div>
      {config.canCreate !== false && <Button onClick={beginCreate}><Plus size={17} className="mr-2"/>Add {config.title.replace(/s$/, "")}</Button>}
    </header>
    <section className="mt-7 overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div className="relative min-w-52 flex-1 sm:max-w-sm"><Search size={16} className="absolute left-3 top-3 text-slate-400"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}…`} className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand"/></div>
        <span className="text-sm text-slate-500">{loading ? "Loading…" : `${visibleRows.length} records`}</span>
      </div>
      {error && <div role="alert" className="border-b bg-red-50 px-4 py-3 text-sm text-red-700">{error}<button className="ml-3 font-semibold underline" onClick={() => void load()}>Retry</button></div>}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{config.columns.map((column) => <th className="whitespace-nowrap px-4 py-3" key={column.key}>{column.label}</th>)}{(config.canEdit !== false || config.canDelete !== false) && <th className="px-4 py-3 text-right">Actions</th>}</tr></thead>
          <tbody>{loading ? <tr><td className="p-8 text-center text-slate-500" colSpan={config.columns.length + 1}>Loading records…</td></tr> : visibleRows.length === 0 ? <tr><td className="p-10 text-center text-slate-500" colSpan={config.columns.length + 1}>{rows.length ? "No matching records." : "No records found yet."}</td></tr> : visibleRows.map((row, index) => <tr className="border-t" key={String(row[idField] ?? index)}>{config.columns.map((column) => <td className="max-w-72 truncate px-4 py-3.5" key={column.key}>{display(readColumn(row, column.key))}</td>)}{(config.canEdit !== false || config.canDelete !== false) && <td className="whitespace-nowrap px-4 py-3 text-right">{config.canEdit !== false && <button aria-label="Edit" onClick={() => beginEdit(row)} className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-brand"><Pencil size={16}/></button>}{config.canDelete !== false && <button aria-label="Delete" onClick={() => void remove(row)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16}/></button>}</td>}</tr>)}</tbody>
        </table>
      </div>
    </section>
    {editing && <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}><section role="dialog" aria-modal="true" aria-labelledby="resource-form-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"><div className="flex items-center justify-between"><div><h2 id="resource-form-title" className="text-xl font-bold">{editing[idField] ? "Edit" : "Add"} {config.title.replace(/s$/, "")}</h2><p className="mt-1 text-sm text-slate-500">Changes are saved to the university system.</p></div><button onClick={() => setEditing(null)} aria-label="Close" className="rounded-lg p-2 hover:bg-slate-100"><X size={18}/></button></div>
      <form onSubmit={save} className="mt-5 grid gap-4 sm:grid-cols-2">{config.fields.map((field) => <label key={field.name} className={`text-sm font-medium ${field.type === "textarea" ? "sm:col-span-2" : ""}`}>{field.label}{field.type === "checkbox" ? <span className="mt-3 flex items-center gap-2"><input type="checkbox" checked={Boolean(form[field.name])} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.checked }))}/><span className="font-normal">Enabled</span></span> : field.type === "textarea" ? <textarea required={field.required} value={String(form[field.name] ?? "")} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} className="mt-1.5 min-h-24 w-full rounded-xl border p-3 outline-none focus:border-brand"/> : field.type === "select" ? <select required={field.required} value={String(form[field.name] ?? "")} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} className="mt-1.5 w-full rounded-xl border bg-white p-3 outline-none focus:border-brand"><option value="">Select {field.label.toLowerCase()}</option>{(field.options ?? (field.source ? choices[field.source]?.map((row) => ({ label: String(row.name ?? row.title ?? row.code ?? row.id), value: String(row.id) })) : [])).map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select> : <input required={field.required} type={field.type ?? "text"} step={field.type === "number" ? "any" : undefined} value={String(form[field.name] ?? "")} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} className="mt-1.5 w-full rounded-xl border p-3 outline-none focus:border-brand"/>}</label>)}
        {error && <p role="alert" className="text-sm text-red-600 sm:col-span-2">{error}</p>}<div className="flex justify-end gap-3 border-t pt-4 sm:col-span-2"><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button></div>
      </form></section></div>}
  </>;
}
