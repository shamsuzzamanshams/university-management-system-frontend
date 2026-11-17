import { cookies } from "next/headers";
import { roleFromToken } from "@/lib/utils";
import { ResourceManager } from "@/components/resource-manager";
import { CourseRegistration } from "@/components/course-registration";
import { courseResources } from "@/lib/resources";

export default async function CoursesPage() {
  const token = (await cookies()).get("campusflow_session")?.value;
  const role = roleFromToken(token);
  if (role === "STUDENT") return <CourseRegistration/>;
  return <ResourceManager config={{ ...courseResources, canCreate: role === "SUPER_ADMIN" || role === "DEPARTMENT_ADMIN", canEdit: role === "SUPER_ADMIN" || role === "DEPARTMENT_ADMIN", canDelete: role === "SUPER_ADMIN" }}/>
}
