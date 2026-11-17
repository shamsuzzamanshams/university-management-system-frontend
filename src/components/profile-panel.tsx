"use client";
import { useEffect, useState } from "react";
import { request } from "@/lib/api";
import { Button } from "@/components/ui/button";

type Profile = Record<string, unknown>;
function flatten(value: unknown): Profile {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const record = value as Profile;
  return record.user && typeof record.user === "object" ? { ...(record.user as Profile), ...record } : record;
}
export function ProfilePanel({ role }: { role?: string }) {
  const [profile, setProfile] = useState<Profile>({});
  const [values, setValues] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const profilePath = role === "STUDENT" ? "student/my-profile" : "auth/me";
    request<unknown>(profilePath).then((data) => {
      const current = flatten(data);
      setProfile(current);
      setValues({ name: String(current.name ?? ""), phone: String(current.phone ?? ""), address: String(current.address ?? "") });
    }).catch((cause) => setMessage(cause instanceof Error ? cause.message : "Could not load your profile.")).finally(() => setLoading(false));
  }, [role]);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (role !== "STUDENT" && role !== "INSTRUCTOR") { setMessage("Profile editing is not enabled for this account role."); return; }
    setSaving(true); setMessage("");
    try {
      await request(role === "STUDENT" ? "student/update-profile" : "instructor/update-my-profile", { method: "PATCH", body: JSON.stringify(values) });
      setMessage("Profile updated successfully.");
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Could not update your profile."); }
    finally { setSaving(false); }
  };
  const label = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
  const relationName = (key: "program" | "department") => {
    const relation = profile[key];
    return relation && typeof relation === "object" ? String((relation as Profile).name ?? (relation as Profile).code ?? "Not assigned") : String(profile[`${key}Name`] ?? "Not assigned");
  };
  return <>
    <header><h1 className="text-3xl font-bold tracking-tight">My profile</h1><p className="mt-2 text-slate-600">View your account details and keep your contact information current.</p></header>
    {message && <p role="status" className="mt-5 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">{message}</p>}
    <section className="mt-7 max-w-3xl rounded-2xl border bg-white p-6">
      {loading ? <p className="text-sm text-slate-500">Loading your profile…</p> : <form onSubmit={save}><div className="grid gap-4 sm:grid-cols-2">{[["name", "Full name"], ["email", "Email"], ["phone", "Phone"], ["address", "Address"]].map(([key, title]) => <label key={key} className="text-sm font-medium">{title}<input disabled={key === "email" || (key !== "name" && role !== "STUDENT" && role !== "INSTRUCTOR")} value={key === "name" || key === "phone" || key === "address" ? values[key as keyof typeof values] : String(profile[key] ?? "")} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} className="mt-1.5 w-full rounded-xl border p-3 disabled:bg-slate-50 disabled:text-slate-500"/></label>)}</div>
        {role === "STUDENT" && <div className="mt-5 rounded-xl bg-blue-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Academic information</p><div className="mt-3 grid gap-3 text-sm sm:grid-cols-2"><p><span className="text-slate-500">Program: </span><span className="font-semibold">{relationName("program")}</span></p><p><span className="text-slate-500">Department: </span><span className="font-semibold">{relationName("department")}</span></p></div></div>}
        <div className="mt-5 rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account information</p><div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">{Object.entries(profile).filter(([key, value]) => !["password", "name", "email", "phone", "address", "user", "student", "instructor", "program", "department"].includes(key) && (typeof value === "string" || typeof value === "number" || typeof value === "boolean")).slice(0, 12).map(([key, value]) => <p key={key}><span className="text-slate-500">{label(key)}: </span>{String(value)}</p>)}</div></div>
        {(role === "STUDENT" || role === "INSTRUCTOR") && <Button disabled={saving} className="mt-5">{saving ? "Saving…" : "Save profile"}</Button>}
      </form>}
    </section>
  </>;
}
