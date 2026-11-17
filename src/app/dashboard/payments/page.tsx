import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { roleFromToken } from "@/lib/utils";
import { PaymentConsole } from "@/components/payment-console";
export default async function PaymentsPage() { const token=(await cookies()).get("campusflow_session")?.value; const role=roleFromToken(token); if (!role || (role !== "STUDENT" && role !== "FINANCE_ADMIN" && role !== "SUPER_ADMIN")) redirect("/dashboard"); return <PaymentConsole role={role}/>; }


