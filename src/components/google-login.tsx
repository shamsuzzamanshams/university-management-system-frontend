"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

declare global { interface Window { google?: { accounts: { id: { initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void; renderButton: (element: HTMLElement, options: Record<string, string | number>) => void } } } } }

export function GoogleLogin() {
  const ref = useRef<HTMLDivElement>(null); const router = useRouter(); const [message, setMessage] = useState("");
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const configured = Boolean(clientId && !clientId.startsWith("your-"));
  useEffect(() => {
    if (!configured || !clientId) { setMessage("Google login needs NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local."); return; }
    const load = () => { if (!window.google || !ref.current) return; window.google.accounts.id.initialize({ client_id: clientId, callback: async ({ credential }) => { const response = await fetch("/api/auth/google", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: credential }) }); if (!response.ok) { setMessage("Google sign-in was rejected by the backend."); return; } router.push("/dashboard"); router.refresh(); } }); window.google.accounts.id.renderButton(ref.current, { theme: "outline", size: "large", width: 380, text: "continue_with" }); };
    const old = document.querySelector('script[src="https://accounts.google.com/gsi/client"]'); if (old) { load(); return; } const script = document.createElement("script"); script.src = "https://accounts.google.com/gsi/client"; script.async = true; script.onload = load; document.head.appendChild(script);
  }, [clientId, configured, router]);
  return <div>{configured ? <div ref={ref} className="flex justify-center" /> : <button type="button" disabled className="w-full rounded-xl border bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500">Continue with Google</button>}{message && <p className="mt-2 text-center text-xs text-slate-500">{message}</p>}</div>;
}
