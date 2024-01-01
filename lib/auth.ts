import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import db from "@/lib/db";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "manager" | "employee";
};

const SESSION_COOKIE = "fleet_session";

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookie = cookies().get(SESSION_COOKIE);
  if (!cookie?.value) return null;
  const userId = Number(cookie.value);
  if (!userId) return null;
  const user = db
    .prepare("SELECT id, name, email, role FROM users WHERE id = ?")
    .get(userId) as SessionUser | undefined;
  return user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(roles: SessionUser["role"][]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect("/");
  }
  return user;
}

export function setSession(userId: number) {
  cookies().set(SESSION_COOKIE, String(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });
}

export function clearSession() {
  cookies().delete(SESSION_COOKIE);
}
