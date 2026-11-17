import { cookies } from "next/headers";
import { roleFromToken } from "@/lib/utils";
import { ProfilePanel } from "@/components/profile-panel";
export default async function ProfilePage() { const token = (await cookies()).get("campusflow_session")?.value; return <ProfilePanel role={roleFromToken(token)}/>; }
