"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, BookOpen, Building2, CalendarDays, ChevronLeft, ChevronRight, ClipboardCheck, CreditCard, GraduationCap, LayoutDashboard, LogOut, School, UserCircle, Users } from "lucide-react";
import type { AppRole } from "@/lib/utils";
import { request } from "@/lib/api";
import { useUiStore } from "@/stores/ui-store";

type NotificationRow = Record<string, unknown>;
function notificationRows(value: unknown): NotificationRow[] {
  if (Array.isArray(value)) return value as NotificationRow[];
  if (value && typeof value === "object") {
    const result = value as Record<string, unknown>;
    for (const key of ["items", "results", "data"]) if (Array.isArray(result[key])) return result[key] as NotificationRow[];
  }
  return [];
}

export function DashboardShell({ role, children }: { role?: AppRole; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { mobileNavigationOpen, setMobileNavigationOpen } = useUiStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const admin = role === "SUPER_ADMIN" || role === "DEPARTMENT_ADMIN";
  const instructor = role === "INSTRUCTOR";
  const finance = role === "FINANCE_ADMIN" || role === "SUPER_ADMIN";
  const canViewCourses = role === "SUPER_ADMIN" || role === "DEPARTMENT_ADMIN" || role === "INSTRUCTOR" || role === "STUDENT";
  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    ...(canViewCourses ? [{ href: "/dashboard/courses", label: role === "STUDENT" ? "Course registration" : "Courses", icon: BookOpen }] : []),
    ...(admin ? [
      { href: "/dashboard/departments", label: "Departments", icon: Building2 },
      { href: "/dashboard/programs", label: "Programs", icon: GraduationCap },
      { href: "/dashboard/semesters", label: "Semesters", icon: CalendarDays },
      { href: "/dashboard/sections", label: "Sections", icon: School },
    ] : []),
    ...((admin || instructor || role === "STUDENT") ? [
      ...((admin || instructor) ? [{ href: "/dashboard/attendance", label: "Attendance", icon: ClipboardCheck }] : []),
      { href: "/dashboard/exams", label: "Exams & results", icon: GraduationCap },
    ] : []),
    ...(finance || role === "STUDENT" ? [{ href: "/dashboard/payments", label: "Payments", icon: CreditCard }] : []),
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
    { href: "/dashboard/profile", label: "My profile", icon: UserCircle },
    ...(admin ? [{ href: "/dashboard/people", label: "People", icon: Users }] : []),
  ];

  useEffect(() => {
    let active = true;
    const refreshUnread = async () => {
      try {
        const data = await request<unknown>("notification");
        if (active) setUnreadCount(notificationRows(data).filter((item) => !Boolean(item.isRead ?? item.read)).length);
      } catch {
        if (active) setUnreadCount(0);
      }
    };
    void refreshUnread();
    window.addEventListener("notifications-updated", refreshUnread);
    const interval = window.setInterval(refreshUnread, 60000);
    return () => {
      active = false;
      window.removeEventListener("notifications-updated", refreshUnread);
      window.clearInterval(interval);
    };
  }, [pathname]);

  return <div className="min-h-screen md:flex">
    <aside className={`flex shrink-0 items-center justify-between border-b bg-white p-4 transition-transform duration-300 md:fixed md:inset-y-0 md:left-0 md:h-screen md:w-64 md:flex-col md:items-stretch md:overflow-y-auto md:border-b-0 md:border-r ${sidebarVisible ? "md:translate-x-0" : "md:-translate-x-full"}`}>
      <div className="flex items-center justify-between"><Link href="/dashboard" className="text-xl font-bold">Uni<span className="text-brand">Nexus</span></Link><button type="button" aria-label="Hide sidebar" title="Hide sidebar" onClick={() => setSidebarVisible(false)} className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-ink md:grid"><ChevronLeft size={18}/></button></div>
      <button className="text-sm font-medium md:hidden" onClick={() => setMobileNavigationOpen(!mobileNavigationOpen)}>Menu</button>
      <nav className={`${mobileNavigationOpen ? "absolute left-0 right-0 top-16 z-10 block border-b bg-white p-4 shadow-lg" : "hidden"} max-h-[70vh] space-y-1 overflow-y-auto md:static md:block md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
        {links.map(({ href, label, icon: Icon }) => <Link onClick={() => setMobileNavigationOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${pathname === href ? "bg-blue-50 text-brand" : "text-slate-600 hover:bg-slate-50"}`} href={href} key={href}>
          <Icon size={18}/><span className="flex-1">{label}</span>{href === "/dashboard/notifications" && unreadCount > 0 && <span aria-label={`${unreadCount} unread notifications`} className="min-w-5 rounded-full bg-red-100 px-1.5 py-0.5 text-center text-xs font-bold text-red-700">{unreadCount > 99 ? "99+" : unreadCount}</span>}
        </Link>)}
      </nav>
      <div className="hidden items-center gap-3 md:block"><span className="rounded-full bg-mint px-2.5 py-1 text-xs font-bold text-emerald-800">{role?.replaceAll("_", " ") ?? "Member"}</span><button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); router.refresh(); }} className="ml-2 inline-flex items-center gap-2 text-sm text-slate-600 md:mt-4 md:ml-0"><LogOut size={16}/><span className="hidden md:inline">Sign out</span></button></div>
    </aside>
    {!sidebarVisible && <button type="button" aria-label="Show sidebar" title="Show sidebar" onClick={() => setSidebarVisible(true)} className="fixed left-3 top-3 z-30 hidden size-8 place-items-center rounded-lg border bg-white p-1.5 text-slate-600 shadow-sm hover:bg-slate-50 hover:text-brand md:grid"><ChevronRight size={15}/></button>}
    <main className={`min-w-0 flex-1 p-5 transition-[margin] duration-300 md:p-9 ${sidebarVisible ? "md:ml-64" : "md:ml-0 md:pt-16"}`}>{children}</main>
  </div>;
}
