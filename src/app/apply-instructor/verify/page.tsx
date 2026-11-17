"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
export default function VerifyInstructorPage() {
  const router=useRouter(); const [email,setEmail]=useState(""); const [otp,setOtp]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  useEffect(()=>setEmail(sessionStorage.getItem("instructorVerifyEmail")??""),[]);
  const submit=async(event:React.FormEvent)=>{event.preventDefault();setBusy(true);setError("");try{const response=await fetch("/api/backend/instructor/apply-as-doctor/verify-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,otp})});const result=await response.json();if(!response.ok)throw new Error(result?.message??"Email verification failed.");sessionStorage.removeItem("instructorVerifyEmail");router.push("/login");}catch(cause){setError(cause instanceof Error?cause.message:"Could not verify email.");}finally{setBusy(false);}};
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5"><section className="w-full max-w-md rounded-2xl border bg-white p-7"><Link href="/" className="text-xl font-bold">Campus<span className="text-brand">Flow</span></Link><h1 className="mt-8 text-3xl font-bold">Verify your email</h1><p className="mt-2 text-slate-600">Enter the six-digit code sent to {email || "your email"}.</p><form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm font-medium">Verification code<input required minLength={6} maxLength={6} inputMode="numeric" value={otp} onChange={(event)=>setOtp(event.target.value.replace(/\D/g,""))} className="mt-1.5 w-full rounded-xl border p-3 tracking-[0.4em]"/></label>{error&&<p role="alert" className="text-sm text-red-600">{error}</p>}<Button disabled={busy||!email} className="w-full">{busy?"Verifying…":"Verify email"}</Button></form></section></main>;
}
