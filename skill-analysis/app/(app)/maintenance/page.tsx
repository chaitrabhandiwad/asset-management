import Link from "next/link";
import db from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function MaintenancePage() {
  const user = await requireUser();
  const maintenance = db
    .prepare(
      `SELECT m.*, c.plate, c.make, c.model, u.name AS created_by_name
       FROM maintenance m
       JOIN cars c ON c.id = m.car_id
       JOIN users u ON u.id = m.created_by
       ORDER BY m.date DESC`
    )
    .all() as Array<{
    id: number;
    date: string;
    type: string;
    mileage: number | null;
    cost: number | null;
    plate: string;
    make: string;
    model: string;
    created_by_name: string;
  }>;

  return (
    <section className="section">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Maintenance</h1>
          <p className="text-sm text-muted-foreground">Service history and cost tracking.</p>
        </div>
        {(user.role === "admin" || user.role === "manager") && (
          <Button asChild>
            <Link href="/maintenance/new">Log Maintenance</Link>
          </Button>
        )}
      </div>

      <div className="table-wrap">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Car</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Mileage</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Logged By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {maintenance.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  No maintenance logged yet
                </TableCell>
              </TableRow>
            )}
            {maintenance.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.date}</TableCell>
                <TableCell>
                  {entry.plate} - {entry.make} {entry.model}
                </TableCell>
                <TableCell>{entry.type}</TableCell>
                <TableCell>{entry.mileage ?? "-"}</TableCell>
                <TableCell>{entry.cost ? `$${entry.cost.toFixed(2)}` : "-"}</TableCell>
                <TableCell>{entry.created_by_name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
