"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function createAssignmentAction(formData: FormData) {
  const user = await requireRole(["admin", "manager"]);
  const carId = Number(formData.get("car_id"));
  const userId = Number(formData.get("user_id"));
  const startDate = String(formData.get("start_date") || "");
  const purpose = String(formData.get("purpose") || "").trim();

  const active = db
    .prepare("SELECT id FROM assignments WHERE car_id = ? AND end_date IS NULL")
    .get(carId) as { id: number } | undefined;

  if (active) {
    redirect("/assignments/new?error=assigned");
  }

  db.prepare(
    `INSERT INTO assignments (car_id, user_id, start_date, purpose, created_by)
     VALUES (?, ?, ?, ?, ?)`
  ).run(carId, userId, startDate, purpose || null, user.id);

  db.prepare("UPDATE cars SET status = 'assigned' WHERE id = ?").run(carId);

  revalidatePath("/assignments");
  revalidatePath("/cars");
  redirect("/assignments");
}

export async function returnAssignmentAction(assignmentId: number) {
  await requireRole(["admin", "manager"]);
  const assignment = db
    .prepare("SELECT car_id FROM assignments WHERE id = ?")
    .get(assignmentId) as { car_id: number } | undefined;

  if (!assignment) {
    redirect("/assignments");
  }

  db.prepare("UPDATE assignments SET end_date = date('now') WHERE id = ?").run(assignmentId);
  db.prepare("UPDATE cars SET status = 'available' WHERE id = ?").run(assignment.car_id);

  revalidatePath("/assignments");
  revalidatePath("/cars");
  redirect("/assignments");
}
