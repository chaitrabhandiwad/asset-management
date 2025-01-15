"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function createMaintenanceAction(formData: FormData) {
  const user = await requireRole(["admin", "manager"]);
  const carId = Number(formData.get("car_id"));
  const type = String(formData.get("type") || "").trim();
  const date = String(formData.get("date") || "");
  const mileage = String(formData.get("mileage") || "");
  const cost = String(formData.get("cost") || "");
  const notes = String(formData.get("notes") || "").trim();

  db.prepare(
    `INSERT INTO maintenance (car_id, type, date, mileage, cost, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    carId,
    type,
    date,
    mileage ? Number(mileage) : null,
    cost ? Number(cost) : null,
    notes || null,
    user.id
  );

  revalidatePath("/maintenance");
  redirect("/maintenance");
}
