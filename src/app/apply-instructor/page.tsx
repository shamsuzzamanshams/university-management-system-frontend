"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { request } from "@/lib/api";
type Department = { id: string; name: string; code?: string };
function departmentRows(value: unknown): Department[] {
  if (Array.isArray(value)) return value as Department[];
  if (value && typeof value === "object") {
    const response = value as Record<string, unknown>;
    if (Array.isArray(response.data)) return response.data as Department[];
    if (Array.isArray(response.items)) return response.items as Department[];
  }
  return [];
}
export default function ApplyInstructorPage() {
  const router = useRouter(); const [values, setValues] = useState({ name: "", email: "", designation: "", departmentId: "" }); const [departments, setDepartments] = useState<Department[]>([]); const [departmentError, setDepartmentError] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { request<unknown>("department").then((data) => setDepartments(departmentRows(data))).catch((cause) => setDepartmentError(cause instanceof Error ? cause.message : "Could not load departments.")); }, []);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setBusy(true); setError(""); try { const response = await fetch("/api/backend/instructor/apply-as-instructor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user: { name: values.name, email: values.email }, instructor: { designation: values.designation, departmentId: values.departmentId } }) }); const result = await response.json(); if (!response.ok) throw new Error(result?.message ?? "Could not submit the instructor application."); sessionStorage.setItem("instructorVerifyEmail", values.email); router.push("/apply-instructor/verify"); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not submit the application."); } finally { setBusy(false); } };
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5"><section className="w-full max-w-xl rounded-2xl border bg-white p-7"><Link href="/" className="text-xl font-bold">Campus<span className="text-brand">Flow</span></Link><h1 className="mt-8 text-3xl font-bold">Instructor application</h1><p className="mt-2 text-slate-600">Submit your details and verify your email to continue.</p><form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">{([["name","Full name"],["email","Email"],["designation","Designation"]] as const).map(([key,label])=><label key={key} className="text-sm font-medium">{label}<input required type={key === "email" ? "email" : "text"} value={values[key]} onChange={(event)=>setValues((current)=>({...current,[key]:event.target.value}))} className="mt-1.5 w-full rounded-xl border p-3"/></label>)}<label className="text-sm font-medium">Department<select required value={values.departmentId} onChange={(event)=>setValues((current)=>({...current,departmentId:event.target.value}))} disabled={!departments.length} className="mt-1.5 w-full rounded-xl border bg-white p-3 disabled:bg-slate-50"><option value="">{departments.length ? "Select a department" : "Loading departments…"}</option>{departments.map((department)=><option value={department.id} key={department.id}>{department.name}{department.code ? ` (${department.code})` : ""}</option>)}</select></label>{departmentError&&<p role="alert" className="text-sm text-red-600 sm:col-span-2">{departmentError}</p>}{error&&<p role="alert" className="text-sm text-red-600 sm:col-span-2">{error}</p>}<Button disabled={busy || !departments.length} className="sm:col-span-2">{busy?"Submitting…":"Submit application"}</Button></form><p className="mt-5 text-sm text-slate-600"><Link href="/register" className="font-semibold text-brand">Back to student registration</Link></p></section></main>;
}
