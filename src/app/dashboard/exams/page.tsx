import { cookies } from "next/headers";
import { roleFromToken } from "@/lib/utils";
import { ResourceManager } from "@/components/resource-manager";
import { ExamResults } from "@/components/exam-results";
import { examResources } from "@/lib/resources";
export default async function ExamsPage() {
  const token=(await cookies()).get("campusflow_session")?.value;
  const role=roleFromToken(token);
  const admin=role === "SUPER_ADMIN" || role === "DEPARTMENT_ADMIN";
  return <><ResourceManager config={{...examResources,canCreate:admin,canEdit:admin,canDelete:admin}}/><ExamResults canManage={admin || role === "INSTRUCTOR"}/></>;
}
