import db from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { createAssignmentAction } from "@/app/actions/assignments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default async function NewAssignmentPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  await requireRole(["admin", "manager"]);
  const error = searchParams?.error === "assigned";

  const cars = db
    .prepare("SELECT * FROM cars WHERE status IN ('available','assigned') ORDER BY plate")
    .all() as Array<{
    id: number;
    plate: string;
    make: string;
    model: string;
    status: string;
  }>;

  const users = db.prepare("SELECT id, name, role FROM users ORDER BY name").all() as Array<{
    id: number;
    name: string;
    role: string;
  }>;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>New Assignment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            This car is already assigned. Return it before reassigning.
          </div>
        )}
        <form action={createAssignmentAction} className="form-grid">
          <div className="space-y-2">
            <Label htmlFor="car_id">Car</Label>
            <select
              id="car_id"
              name="car_id"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.plate} - {car.make} {car.model} ({car.status})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="user_id">Driver</Label>
            <select
              id="user_id"
              name="user_id"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input id="start_date" name="start_date" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input id="purpose" name="purpose" />
          </div>
          <Button type="submit">Assign</Button>
        </form>
      </CardContent>
    </Card>
  );
}
