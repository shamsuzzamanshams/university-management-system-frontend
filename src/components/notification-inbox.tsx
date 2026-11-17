"use client";
import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, Send, Trash2 } from "lucide-react";
import { request } from "@/lib/api";
import { Button } from "@/components/ui/button";

type Notice = Record<string, unknown>;
function list(value: unknown): Notice[] { if (Array.isArray(value)) return value as Notice[]; if (value && typeof value === "object") { const object = value as Record<string, unknown>; for (const key of ["items", "results", "data"]) if (Array.isArray(object[key])) return object[key] as Notice[]; } return []; }
export function NotificationInbox({ canBroadcast }: { canBroadcast: boolean }) {
  const [items, setItems] = useState<Notice[]>([]); const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(true); const [publishing, setPublishing] = useState(false); const [title, setTitle] = useState(""); const [body, setBody] = useState("");
  const load = useCallback(async () => { setLoading(true); try { setItems(list(await request<unknown>("notification"))); setError(""); window.dispatchEvent(new Event("notifications-updated")); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load notifications."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  const publish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setPublishing(true); setError(""); setMessage("");
    try {
      const result = await request<{ count?: number }>("notification/broadcast", { method: "POST", body: JSON.stringify({ title, message: body }) });
      setMessage(`Notice published to ${result.count ?? "all"} users.`); setTitle(""); setBody(""); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not publish the notice."); }
    finally { setPublishing(false); }
  };
  const markAll = async () => { try { await request("notification/read-all", { method: "PATCH", body: "{}" }); await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update notifications."); } };
  const markRead = async (id: string) => { try { await request(`notification/${encodeURIComponent(id)}/read`, { method: "PATCH", body: "{}" }); await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update notification."); } };
  const remove = async (id: string) => { try { await request(`notification/${encodeURIComponent(id)}`, { method: "DELETE" }); await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not delete notification."); } };
  return <>
    <header className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold tracking-tight">Notifications</h1><p className="mt-2 text-slate-600">University notices and updates for your account.</p></div><button onClick={() => void markAll()} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"><CheckCheck size={16}/>Mark all as read</button></header>
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
    {canBroadcast && <section className="mt-6 rounded-2xl border bg-white p-5"><h2 className="text-lg font-bold">Publish a notice</h2><p className="mt-1 text-sm text-slate-500">This notice will appear in every existing user&apos;s notification list.</p><form onSubmit={publish} className="mt-4 grid gap-4"><label className="text-sm font-medium">Title<input required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 w-full rounded-xl border p-3"/></label><label className="text-sm font-medium">Message<textarea required value={body} onChange={(event) => setBody(event.target.value)} rows={4} className="mt-1.5 w-full rounded-xl border p-3"/></label><div><Button disabled={publishing}><Send size={16} className="mr-2"/>{publishing ? "Publishing…" : "Publish to all users"}</Button></div></form></section>}
    <section className="mt-6 divide-y overflow-hidden rounded-2xl border bg-white">{loading ? <p className="p-8 text-center text-slate-500">Loading notifications…</p> : items.length ? items.map((notice,index) => { const id = String(notice.id ?? notice.notificationId ?? index); const read = Boolean(notice.isRead ?? notice.read); return <article key={id} className={`flex items-start gap-4 p-5 ${read ? "" : "bg-blue-50/60"}`}><span className={`mt-1 rounded-full p-2 ${read ? "bg-slate-100 text-slate-500" : "bg-blue-100 text-brand"}`}><Bell size={17}/></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{String(notice.title ?? "Notification")}</h2>{!read && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-brand">New</span>}</div><p className="mt-1 text-sm text-slate-600">{String(notice.message ?? "")}</p><p className="mt-2 text-xs text-slate-400">{String(notice.createdAt ?? "").slice(0,19).replace("T", " ")}</p></div><div className="flex gap-1">{!read && <button aria-label="Mark as read" onClick={() => void markRead(id)} className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-brand"><CheckCheck size={17}/></button>}<button aria-label="Delete notification" onClick={() => void remove(id)} className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-red-600"><Trash2 size={17}/></button></div></article>; }) : <div className="p-10 text-center text-slate-500"><Bell className="mx-auto mb-3"/><p>You&apos;re all caught up.</p></div>}</section>
  </>;
}
