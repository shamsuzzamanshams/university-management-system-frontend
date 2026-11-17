import { cookies } from "next/headers";
import { roleFromToken } from "@/lib/utils";
import { NotificationInbox } from "@/components/notification-inbox";
export default async function NotificationsPage() {
  const token=(await cookies()).get("campusflow_session")?.value;
  const role=roleFromToken(token);
  return <NotificationInbox canBroadcast={role === "SUPER_ADMIN" || role === "DEPARTMENT_ADMIN"}/>;
}
