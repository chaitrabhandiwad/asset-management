import db from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { createMaintenanceAction } from "@/app/actions/maintenance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default async function NewMaintenancePage() {
  await requireRole(["admin", "manager"]);
  const cars = db.prepare("SELECT id, plate, make, model FROM cars ORDER BY plate").all() as Array<{
    id: number;
    plate: string;
    make: string;
    model: string;
  }>;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Log Maintenance</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={createMaintenanceAction} className="form-grid">
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
                  {car.plate} - {car.make} {car.model}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Input id="type" name="type" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage</Label>
              <Input id="mileage" name="mileage" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input id="cost" name="cost" type="number" step="0.01" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" />
          </div>
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  );
}
