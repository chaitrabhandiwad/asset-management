"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function createUserAction(formData: FormData) {
  await requireRole(["admin"]);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "employee") as "admin" | "manager" | "employee";
  const password = String(formData.get("password") || "");

  try {
    const passwordHash = bcrypt.hashSync(password, 10);
    db.prepare(
      "INSERT INTO users (name, email, role, password_hash) VALUES (?, ?, ?, ?)"
    ).run(name, email, role, passwordHash);
  } catch {
    redirect("/users/new?error=exists");
  }

  revalidatePath("/users");
  redirect("/users");
}
