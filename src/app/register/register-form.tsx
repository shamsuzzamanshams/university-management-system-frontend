"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
const password = z.string().min(8).regex(/[A-Z]/,"Include an uppercase letter").regex(/[a-z]/,"Include a lowercase letter").regex(/[0-9]/,"Include a number").regex(/[^A-Za-z0-9]/,"Include a special character");
const schema = z.object({ name: z.string().min(3).max(30), email: z.string().email(), password });
type Values = z.infer<typeof schema>;
export function RegisterForm() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<Values>({ resolver: zodResolver(schema) });
  const submit = async (values: Values) => { try { const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) }); const result = await response.json().catch(() => null); if (!response.ok) { setError("root", { message: result?.message ?? "Registration could not be started." }); return; } sessionStorage.setItem("verifyEmail", values.email); router.push("/register/verify"); } catch { setError("root", { message: "Could not contact the registration service." }); } };
  return <div className="w-full max-w-lg"><Link href="/" className="text-xl font-bold">Uni<span className="text-brand">Nexus</span></Link><h1 className="mt-8 text-3xl font-bold">Create student account</h1><p className="mt-2 text-slate-600">We&apos;ll email you a 6-digit verification code.</p><form className="mt-6 grid gap-4" onSubmit={handleSubmit(submit)}><label className="text-sm font-medium">Full name<input className="mt-1 w-full rounded-xl border p-3" autoComplete="name" {...register("name")}/>{errors.name&&<small className="text-red-600">{errors.name.message}</small>}</label><label className="text-sm font-medium">Email<input className="mt-1 w-full rounded-xl border p-3" type="email" autoComplete="email" {...register("email")}/>{errors.email&&<small className="text-red-600">{errors.email.message}</small>}</label><label className="text-sm font-medium">Password<input className="mt-1 w-full rounded-xl border p-3" type="password" autoComplete="new-password" {...register("password")}/>{errors.password&&<small className="text-red-600">{errors.password.message}</small>}</label>{errors.root&&<p className="text-sm text-red-600">{errors.root.message}</p>}<Button disabled={isSubmitting}>{isSubmitting?"Sending code…":"Create account"}</Button></form><p className="mt-5 text-sm text-slate-600">Applying as an instructor? <Link href="/apply-instructor" className="font-semibold text-brand">Start an application</Link></p><p className="mt-3 text-sm text-slate-600">Already registered? <Link href="/login" className="font-semibold text-brand">Sign in</Link></p></div>;
}
