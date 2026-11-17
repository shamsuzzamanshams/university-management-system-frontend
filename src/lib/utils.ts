import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export type AppRole = "SUPER_ADMIN" | "DEPARTMENT_ADMIN" | "REGISTRAR" | "FINANCE_ADMIN" | "INSTRUCTOR" | "STUDENT";
export const roleLabel: Record<AppRole, string> = { SUPER_ADMIN: "Administrator", DEPARTMENT_ADMIN: "Department admin", REGISTRAR: "Registrar", FINANCE_ADMIN: "Finance officer", INSTRUCTOR: "Instructor", STUDENT: "Student" };
export function roleFromToken(token?: string): AppRole | undefined { try { const payload = token?.split(".")[1]; return payload ? JSON.parse(atob(payload.replace(/-/g,"+").replace(/_/g,"/"))).role : undefined; } catch { return undefined; } }
