import { createCarAction } from "@/app/actions/cars";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function NewCarPage({ searchParams }: { searchParams?: { error?: string } }) {
  await requireRole(["admin", "manager"]);
  const error = searchParams?.error === "duplicate";

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Add Car</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            VIN or plate already exists.
          </div>
        )}
        <form action={createCarAction} className="form-grid">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vin">VIN</Label>
              <Input id="vin" name="vin" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plate">Plate</Label>
              <Input id="plate" name="plate" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input id="make" name="make" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" name="model" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input id="year" name="year" type="number" min={1980} max={2100} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" />
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
