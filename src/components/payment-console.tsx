"use client";
import { useEffect, useMemo, useState } from "react";
import { CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { request } from "@/lib/api";

type Row = Record<string, unknown>;
function rows(value: unknown): Row[] { if (Array.isArray(value)) return value as Row[]; if (value && typeof value === "object") { const object = value as Record<string, unknown>; for (const key of ["items", "results", "data"]) if (Array.isArray(object[key])) return object[key] as Row[]; } return []; }
export function PaymentConsole({ role }: { role?: string }) {
  const [semesters, setSemesters] = useState<Row[]>([]); const [payments, setPayments] = useState<Row[]>([]); const [semesterId, setSemesterId] = useState(""); const [amount, setAmount] = useState(process.env.NEXT_PUBLIC_SEMESTER_REGISTRATION_AMOUNT ?? "420"); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  useEffect(() => {
    const admin = role === "FINANCE_ADMIN" || role === "SUPER_ADMIN";
    const tasks = [request<unknown>(admin ? "payment/all-payments" : "payment/my-payments").then((data) => setPayments(rows(data)))];
    if (role === "STUDENT") tasks.push(fetch("/api/payments/bkash", { cache: "no-store" }).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data?.message ?? "Could not load semesters."); const open = rows(data?.data).filter((item) => item.registrationOpen); setSemesters(open); if (open[0]?.id) setSemesterId(String(open[0].id)); }));
    Promise.all(tasks).catch((cause) => setError(cause instanceof Error ? cause.message : "Could not load payments."));
  }, [role]);
  const unpaid = useMemo(() => payments.filter((item) => String(item.status ?? "").toUpperCase() === "UNPAID"), [payments]);
  const checkout = async () => {
    if (role !== "STUDENT") return;
    setLoading(true); setError("");
    try {
      if (!semesterId) throw new Error("Select an open semester first.");
      const existing = unpaid[0];
      const response = await fetch(existing ? "/api/payments/bkash/retry" : "/api/payments/bkash", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(existing ? { feeId: existing.id } : { semesterId, amount: Number(amount), description: "Semester registration tuition fee" }) });
      const result = await response.json().catch(() => null);
      const paymentUrl = result?.data?.paymentUrl ?? result?.data?.bkashURL ?? result?.data?.paymentURL;
      if (!response.ok || !paymentUrl) throw new Error(result?.message ?? "The payment service did not return a checkout link.");
      window.location.assign(paymentUrl);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not start bKash checkout."); }
    finally { setLoading(false); }
  };
  return <><h1 className="text-3xl font-bold tracking-tight">Payments</h1><p className="mt-2 text-slate-600">{role === "STUDENT" ? "Review tuition invoices and pay registration fees securely with bKash." : "Review university payment records."}</p>{error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}<div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.3fr]">{role === "STUDENT" && <section className="rounded-2xl bg-[#e2136e] p-6 text-white"><Smartphone/><p className="mt-8 text-sm text-pink-100">Semester registration fee</p><label className="mt-1 block text-4xl font-bold">৳ <input aria-label="Registration amount in BDT" type="number" min="1" step="any" value={amount} readOnly className="w-40 bg-transparent outline-none"/></label><label className="mt-5 block text-sm font-medium">Open semester<select value={semesterId} onChange={(event) => setSemesterId(event.target.value)} className="mt-2 w-full rounded-xl border border-white/30 bg-white p-3 text-slate-900" disabled={semesters.length === 0}><option value="">Select a semester</option>{semesters.map((semester) => <option key={String(semester.id)} value={String(semester.id)}>{String(semester.name)} ({String(semester.code)})</option>)}</select></label><p className="mt-4 text-sm text-pink-100">{unpaid.length ? "An unpaid invoice is ready to retry." : "You will continue to bKash secure checkout."}</p><Button onClick={checkout} disabled={loading || (!semesterId && unpaid.length === 0) || !amount} className="mt-7 bg-white text-[#e2136e] hover:bg-pink-50">{loading ? "Starting checkout…" : unpaid.length ? "Retry unpaid invoice" : "Pay with bKash"}</Button></section>}<section className="overflow-hidden rounded-2xl border bg-white lg:col-span-1"><div className="border-b p-5"><h2 className="font-bold">Payment history</h2><p className="mt-1 text-sm text-slate-500">Invoices and payment status</p></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-4">Description</th><th className="p-4">Due date</th><th className="p-4">Amount</th><th className="p-4">Status</th></tr></thead><tbody>{payments.length ? payments.map((payment,index)=><tr key={String(payment.id ?? index)} className="border-t"><td className="p-4">{String(payment.description ?? "Semester fee")}</td><td className="p-4">{String(payment.dueDate ?? "—").slice(0,10)}</td><td className="p-4">{String(payment.currency ?? "BDT")} {Number(payment.amount ?? 0).toLocaleString()}</td><td className="p-4">{String(payment.status ?? "—")}</td></tr>) : <tr><td colSpan={4} className="p-8 text-center text-slate-500"><CreditCard className="mx-auto mb-2 text-brand"/>No invoices found.</td></tr>}</tbody></table></div></section></div></>;
}


