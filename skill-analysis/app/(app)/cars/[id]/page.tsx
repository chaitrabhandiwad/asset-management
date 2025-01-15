import { notFound } from "next/navigation";
import db from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateCarAction, deleteCarAction } from "@/app/actions/cars";

export default async function CarDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const car = db.prepare("SELECT * FROM cars WHERE id = ?").get(params.id) as
    | {
        id: number;
        vin: string;
        plate: string;
        make: string;
        model: string;
        year: number;
        status: "available" | "assigned" | "maintenance" | "retired";
        location: string | null;
        notes: string | null;
      }
    | undefined;

  if (!car) return notFound();

  const assignments = db
    .prepare(
      `SELECT a.*, u.name AS driver
       FROM assignments a
       JOIN users u ON u.id = a.user_id
       WHERE a.car_id = ?
       ORDER BY a.start_date DESC`
    )
    .all(car.id) as Array<{
    id: number;
    start_date: string;
    end_date: string | null;
    purpose: string | null;
    driver: string;
  }>;

  const maintenance = db
    .prepare(
      `SELECT m.*, u.name AS created_by_name
       FROM maintenance m
       JOIN users u ON u.id = m.created_by
       WHERE m.car_id = ?
       ORDER BY m.date DESC`
    )
    .all(car.id) as Array<{
    id: number;
    date: string;
    type: string;
    mileage: number | null;
    cost: number | null;
    notes: string | null;
  }>;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>
            {car.plate} - {car.make} {car.model}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>VIN:</strong> {car.vin}
          </p>
          <p>
            <strong>Year:</strong> {car.year}
          </p>
          <p>
            <strong>Status:</strong> <Badge variant={car.status}>{car.status}</Badge>
          </p>
          <p>
            <strong>Location:</strong> {car.location || "-"}
          </p>
          <p>
            <strong>Notes:</strong> {car.notes || "-"}
          </p>
        </CardContent>
      </Card>

      {(user.role === "admin" || user.role === "manager") && (
        <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateCarAction.bind(null, car.id)} className="form-inline">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={car.status}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="available">available</option>
                  <option value="assigned">assigned</option>
                  <option value="maintenance">maintenance</option>
                  <option value="retired">retired</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" defaultValue={car.location || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" name="notes" defaultValue={car.notes || ""} />
              </div>
              <Button type="submit">Update</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="table-wrap">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Purpose</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No assignments yet
                    </TableCell>
                  </TableRow>
                )}
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>{assignment.driver}</TableCell>
                    <TableCell>{assignment.start_date}</TableCell>
                    <TableCell>{assignment.end_date || "-"}</TableCell>
                    <TableCell>{assignment.purpose || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="table-wrap">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Mileage</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenance.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      No maintenance records yet
                    </TableCell>
                  </TableRow>
                )}
                {maintenance.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.type}</TableCell>
                    <TableCell>{entry.mileage ?? "-"}</TableCell>
                    <TableCell>{entry.cost ? `$${entry.cost.toFixed(2)}` : "-"}</TableCell>
                    <TableCell>{entry.notes || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {user.role === "admin" && (
        <Card className="border-destructive/20 bg-red-50">
          <CardHeader>
            <CardTitle>Delete Car</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={deleteCarAction.bind(null, car.id)}>
              <Button variant="destructive" type="submit">
                Delete
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
