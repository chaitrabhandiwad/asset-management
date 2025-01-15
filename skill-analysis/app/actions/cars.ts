"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function createCarAction(formData: FormData) {
  await requireRole(["admin", "manager"]);
  const payload = {
    vin: String(formData.get("vin") || "").trim(),
    plate: String(formData.get("plate") || "").trim(),
    make: String(formData.get("make") || "").trim(),
    model: String(formData.get("model") || "").trim(),
    year: Number(formData.get("year")),
    location: String(formData.get("location") || "").trim(),
    notes: String(formData.get("notes") || "").trim()
  };

  try {
    db.prepare(
      `INSERT INTO cars (vin, plate, make, model, year, location, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      payload.vin,
      payload.plate,
      payload.make,
      payload.model,
      payload.year,
      payload.location || null,
      payload.notes || null
    );
  } catch {
    redirect("/cars/new?error=duplicate");
  }

  revalidatePath("/cars");
  redirect("/cars");
}

export async function updateCarAction(carId: number, formData: FormData) {
  await requireRole(["admin", "manager"]);
  const status = String(formData.get("status") || "available");
  const location = String(formData.get("location") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  db.prepare("UPDATE cars SET status = ?, location = ?, notes = ? WHERE id = ?").run(
    status,
    location || null,
    notes || null,
    carId
  );

  revalidatePath(`/cars/${carId}`);
  redirect(`/cars/${carId}`);
}

export async function deleteCarAction(carId: number) {
  await requireRole(["admin"]);
  db.prepare("DELETE FROM cars WHERE id = ?").run(carId);
  revalidatePath("/cars");
  redirect("/cars");
}
