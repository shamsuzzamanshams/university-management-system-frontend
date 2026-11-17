import { cookies } from "next/headers";
import { DashboardShell } from "@/components/dashboard-shell";
import { roleFromToken } from "@/lib/utils";
export default async function DashboardLayout({ children }: { children: React.ReactNode }) { const token = (await cookies()).get("campusflow_session")?.value; return <DashboardShell role={roleFromToken(token)}>{children}</DashboardShell>; }
