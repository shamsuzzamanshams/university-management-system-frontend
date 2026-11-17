"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { request } from "@/lib/api";
import { Button } from "@/components/ui/button";

type Person = Record<string, unknown>;
type PeopleView = "students" | "instructors";
function list(value: unknown): Person[] {
  if (Array.isArray(value)) return value as Person[];
  if (value && typeof value === "object") {
    const result = value as Record<string, unknown>;
    for (const key of ["items", "results", "data"]) if (Array.isArray(result[key])) return result[key] as Person[];
  }
  return [];
}
function relationName(value: unknown) {
  return value && typeof value === "object" ? String((value as Person).name ?? "—") : "—";
}
export default function PeoplePage() {
  const [view, setView] = useState<PeopleView>("students");
  const [students, setStudents] = useState<Person[]>([]);
  const [instructors, setInstructors] = useState<Person[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const load = useCallback(async (selectedView: PeopleView) => {
    setLoading(true); setError("");
    try {
      const data = await request<unknown>(selectedView === "students" ? "student/all-students" : "instructor/all-doctors?limit=1000");
      if (selectedView === "students") setStudents(list(data)); else setInstructors(list(data));
    } catch (cause) { setError(cause instanceof Error ? cause.message : `Could not load ${selectedView}.`); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(view); }, [load, view]);
  const people = view === "students" ? students : instructors;
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return people;
    return people.filter((person) => JSON.stringify(person).toLowerCase().includes(term));
  }, [people, search]);
  const approve = async (instructor: Person) => {
    const id = String(instructor.id ?? instructor.instructorId ?? "");
    if (!id) return;
    setBusyId(id); setError(""); setMessage("");
    try {
      await request("instructor/approve-doctor", { method: "POST", body: JSON.stringify({ instructorId: id }) });
      setMessage(`${String(instructor.name ?? "Instructor")} approved.`);
      await load("instructors");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not approve instructor."); }
    finally { setBusyId(""); }
  };
  return <>
    <header><h1 className="text-3xl font-bold tracking-tight">People</h1><p className="mt-2 text-slate-600">View students and instructors in your university.</p></header>
    <div className="mt-6 flex flex-wrap gap-3"><Button variant={view === "students" ? "default" : "outline"} onClick={() => { setView("students"); setSearch(""); }}><Users size={16} className="mr-2"/>Students</Button><Button variant={view === "instructors" ? "default" : "outline"} onClick={() => { setView("instructors"); setSearch(""); }}><Users size={16} className="mr-2"/>Instructors</Button></div>
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}<button onClick={() => void load(view)} className="ml-3 font-semibold underline">Retry</button></p>}{message && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
    <section className="mt-5 overflow-hidden rounded-2xl border bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b p-4"><div><h2 className="font-bold">All {view}</h2><p className="mt-1 text-sm text-slate-500">{loading ? "Loading…" : `${filtered.length} ${view}`}</p></div><label className="relative block w-full sm:max-w-xs"><Search size={16} className="absolute left-3 top-3 text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${view}`} className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm"/></label></div>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{view === "students" ? <><th className="p-4">Student ID</th><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Department</th><th className="p-4">Program</th></> : <><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Designation</th><th className="p-4">Department</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></>}</tr></thead><tbody>
        {loading ? <tr><td colSpan={view === "students" ? 5 : 6} className="p-8 text-center text-slate-500">Loading {view}…</td></tr> : !filtered.length ? <tr><td colSpan={view === "students" ? 5 : 6} className="p-8 text-center text-slate-500">No {view} found.</td></tr> : filtered.map((person, index) => <tr key={String(person.id ?? index)} className="border-t">{view === "students" ? <><td className="p-4">{String(person.studentId ?? "—")}</td><td className="p-4 font-medium">{String(person.name ?? "—")}</td><td className="p-4">{String(person.email ?? "—")}</td><td className="p-4">{relationName(person.department)}</td><td className="p-4">{relationName(person.program)}</td></> : <><td className="p-4 font-medium">{String(person.name ?? "—")}</td><td className="p-4">{String(person.email ?? "—")}</td><td className="p-4">{String(person.designation ?? "—")}</td><td className="p-4">{relationName(person.department)}</td><td className="p-4">{String(person.verificationStatus ?? "—")}</td><td className="p-4 text-right">{String(person.verificationStatus).toUpperCase() === "PENDING" && <Button disabled={busyId === String(person.id)} onClick={() => void approve(person)}>{busyId === String(person.id) ? "Approving…" : "Approve"}</Button>}</td></>}</tr>)}
      </tbody></table></div></section>
  </>;
}
