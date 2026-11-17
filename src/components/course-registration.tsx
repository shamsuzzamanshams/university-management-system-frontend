"use client";
import { useEffect, useState } from "react";
import { request } from "@/lib/api";
import { Button } from "@/components/ui/button";

type RecordItem = Record<string, unknown>;
type CachedSemester = { selected: string[]; registered: RecordItem[] };
type RegistrationCache = { activeSemesterId: string; bySemester: Record<string, CachedSemester> };
function readCache(key: string): RegistrationCache {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as RegistrationCache : { activeSemesterId: "", bySemester: {} }; }
  catch { return { activeSemesterId: "", bySemester: {} }; }
}
function writeCache(key: string, cache: RegistrationCache) {
  try { localStorage.setItem(key, JSON.stringify(cache)); } catch { /* Storage may be disabled or full. */ }
}
function rows(data: unknown): RecordItem[] {
  if (Array.isArray(data)) return data as RecordItem[];
  if (data && typeof data === "object") {
    const value = data as Record<string, unknown>;
    for (const key of ["items", "results", "data"]) if (Array.isArray(value[key])) return value[key] as RecordItem[];
  }
  return [];
}
export function CourseRegistration() {
  const [semesters, setSemesters] = useState<RecordItem[]>([]);
  const [courses, setCourses] = useState<RecordItem[]>([]);
  const [semesterId, setSemesterId] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [registered, setRegistered] = useState<RecordItem[]>([]);
  const [storageKey, setStorageKey] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const registeredIds = new Set(registered.map((item) => {
    const course = item.course && typeof item.course === "object" ? item.course as RecordItem : item;
    return String(course.id ?? course.courseId ?? item.courseId ?? "");
  }));
  useEffect(() => {
    Promise.all([request<unknown>("semester"), request<unknown>("course"), request<unknown>("student/my-profile").catch(() => null)]).then(([semesterData, courseData, profileData]) => {
      const allSemesters = rows(semesterData);
      setSemesters(allSemesters);
      setCourses(rows(courseData));
      const profile = profileData && typeof profileData === "object" ? profileData as RecordItem : {};
      const studentKey = String(profile.id ?? profile.studentId ?? profile.userId ?? "current");
      const key = `campusflow-course-registration:${studentKey}`;
      setStorageKey(key);
      const cache = readCache(key);
      const open = allSemesters.find((semester) => String(semester.id) === cache.activeSemesterId && semester.registrationOpen) ?? allSemesters.find((semester) => semester.registrationOpen);
      if (open?.id) {
        const activeId = String(open.id);
        const saved = cache.bySemester[activeId] ?? { selected: [], registered: [] };
        setSemesterId(activeId);
        setSelected(saved.selected);
        setRegistered(saved.registered);
        writeCache(key, { ...cache, activeSemesterId: activeId });
      }
    }).catch((cause) => setError(cause instanceof Error ? cause.message : "Could not load registration options.")).finally(() => setLoading(false));
  }, []);
  const changeSemester = (nextSemesterId: string) => {
    setSemesterId(nextSemesterId);
    const cache = storageKey ? readCache(storageKey) : { activeSemesterId: "", bySemester: {} };
    const saved = cache.bySemester[nextSemesterId] ?? { selected: [], registered: [] };
    setSelected(saved.selected);
    setRegistered(saved.registered);
    if (storageKey) writeCache(storageKey, { ...cache, activeSemesterId: nextSemesterId });
  };
  const toggleCourse = (courseId: string, checked: boolean) => {
    const nextSelected = checked ? [...selected, courseId] : selected.filter((value) => value !== courseId);
    setSelected(nextSelected);
    if (!storageKey || !semesterId) return;
    const cache = readCache(storageKey);
    writeCache(storageKey, { ...cache, activeSemesterId: semesterId, bySemester: { ...cache.bySemester, [semesterId]: { ...(cache.bySemester[semesterId] ?? { registered }), selected: nextSelected } } });
  };
  const register = async () => {
    if (selected.length !== 8) { setError("Choose exactly 8 courses to submit your registration."); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      await request("courseRegistration/submit", { method: "POST", body: JSON.stringify({ semesterId, academicYear: new Date().getFullYear(), semester: new Date().getMonth() < 6 ? 1 : 2, courses: selected.map((courseId) => ({ courseId })) }) });
      setRegistered(courses.filter((course) => selected.includes(String(course.id ?? course.courseId ?? ""))));
      setSelected([]);
      if (storageKey) {
        const cache = readCache(storageKey);
        writeCache(storageKey, { ...cache, activeSemesterId: semesterId, bySemester: { ...cache.bySemester, [semesterId]: { selected: [], registered: courses.filter((course) => selected.includes(String(course.id ?? course.courseId ?? ""))) } } });
      }
      setSuccess("Your 8-course registration was submitted successfully.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Course registration failed."); }
    finally { setSaving(false); }
  };
  return <>
    <header><h1 className="text-3xl font-bold tracking-tight">Course registration</h1><p className="mt-2 text-slate-600">Choose eight courses for an open semester. Your submitted courses appear below.</p></header>
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {success && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}
    <section className="mt-7 rounded-2xl border bg-white p-5"><label className="block max-w-lg text-sm font-medium">Semester<select value={semesterId} onChange={(event) => changeSemester(event.target.value)} className="mt-2 w-full rounded-xl border bg-white p-3"><option value="">Choose an open semester</option>{semesters.filter((item) => item.registrationOpen).map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.name ?? item.code)}</option>)}</select></label>
      <div className="mt-5 divide-y rounded-xl border">{loading ? <p className="p-5 text-sm text-slate-500">Loading courses…</p> : courses.length ? courses.map((course) => { const id = String(course.id ?? course.courseId ?? ""); const checked = selected.includes(id); const isRegistered = registeredIds.has(id); return <label key={id} className={`flex items-center gap-3 border-l-4 p-4 transition-colors ${isRegistered ? "cursor-not-allowed border-emerald-500 bg-emerald-50/60" : checked ? "cursor-pointer border-brand bg-blue-50" : "cursor-pointer border-transparent hover:bg-slate-50"}`}><input type="checkbox" checked={checked} onChange={(event) => toggleCourse(id, event.target.checked)} disabled={!semesterId || isRegistered || (!checked && selected.length >= 8)}/><span className="flex-1"><span className="font-semibold">{String(course.code ?? "Course")} · {String(course.title ?? course.name ?? "")}</span><span className="ml-2 text-sm text-slate-500">{String(course.credits ?? "")} credits</span></span>{isRegistered ? <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Registered</span> : checked && <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-brand">Selected</span>}</label>; }) : <p className="p-5 text-sm text-slate-500">No courses are available.</p>}</div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className="text-sm text-slate-500">{selected.length} of 8 selected</span><Button onClick={register} disabled={saving || !semesterId}>{saving ? "Submitting…" : "Submit registration"}</Button></div>
    </section>
    <section className="mt-8"><h2 className="text-xl font-bold">Registered courses</h2><div className="mt-3 overflow-x-auto rounded-2xl border bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-4">Course</th><th className="p-4">Code</th><th className="p-4">Credits</th></tr></thead><tbody>{registered.length ? registered.map((item, index) => { const course = (item.course ?? item) as RecordItem; return <tr key={String(item.id ?? index)} className="border-t"><td className="p-4">{String(course.title ?? course.name ?? "Course")}</td><td className="p-4">{String(course.code ?? "—")}</td><td className="p-4">{String(course.credits ?? "—")}</td></tr>; }) : <tr><td colSpan={3} className="p-5 text-center text-slate-500">No registered courses for this semester yet.</td></tr>}</tbody></table></div></section>
  </>;
}
