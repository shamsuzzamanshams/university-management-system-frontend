import { cookies } from "next/headers";
import { roleFromToken } from "@/lib/utils";
import { ResourceManager } from "@/components/resource-manager";
import { attendanceResources } from "@/lib/resources";
export default async function AttendancePage() {
  const token=(await cookies()).get("campusflow_session")?.value;
  const role=roleFromToken(token);
  const canManage=role === "SUPER_ADMIN" || role === "DEPARTMENT_ADMIN" || role === "INSTRUCTOR";
  return <ResourceManager config={{...attendanceResources,canCreate:canManage,canEdit:canManage,canDelete:canManage}}/>;
}
