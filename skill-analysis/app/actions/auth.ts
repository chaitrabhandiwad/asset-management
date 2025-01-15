"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { clearSession, setSession } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) {
    redirect("/login?error=missing");
  }
  const user = db
    .prepare("SELECT id, password_hash FROM users WHERE email = ?")
    .get(email) as { id: number; password_hash: string } | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    redirect("/login?error=invalid");
  }

  setSession(user.id);
  redirect("/");
}

export async function logoutAction() {
  clearSession();
  redirect("/login");
}
