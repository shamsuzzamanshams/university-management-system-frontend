import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { roleFromToken } from "@/lib/utils";
import { ResourceManager, type ResourceConfig } from "@/components/resource-manager";

export async function AdminResourcePage({ config }: { config: ResourceConfig }) {
  const token = (await cookies()).get("campusflow_session")?.value;
  const role = roleFromToken(token);
  if (role !== "SUPER_ADMIN" && role !== "DEPARTMENT_ADMIN") redirect("/dashboard");
  const superAdmin = role === "SUPER_ADMIN";
  return <ResourceManager config={{ ...config, canCreate: true, canEdit: true, canDelete: superAdmin }}/>;
}
