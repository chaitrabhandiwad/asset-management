import Link from "next/link";
import db from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function DashboardPage() {
  await requireUser();

  const counts = {
    cars: db.prepare("SELECT COUNT(*) AS count FROM cars").get().count as number,
    assignments: db
      .prepare("SELECT COUNT(*) AS count FROM assignments WHERE end_date IS NULL")
      .get().count as number,
    maintenance: db.prepare("SELECT COUNT(*) AS count FROM maintenance").get().count as number
  };

  const activeAssignments = db
    .prepare(
      `SELECT a.id, a.start_date, a.purpose, c.plate, c.make, c.model, u.name AS driver
       FROM assignments a
       JOIN cars c ON c.id = a.car_id
       JOIN users u ON u.id = a.user_id
       WHERE a.end_date IS NULL
       ORDER BY a.start_date DESC
       LIMIT 5`
    )
    .all() as Array<{
    id: number;
    start_date: string;
    purpose: string | null;
    plate: string;
    make: string;
    model: string;
    driver: string;
  }>;

  return (
    <div className="space-y-10">
      <section className="card-grid">
        <Card>
          <CardHeader>
            <CardTitle>Total Cars</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="metric">{counts.cars}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="metric">{counts.assignments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="metric">{counts.maintenance}</div>
          </CardContent>
        </Card>
      </section>

      <section className="section">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Active Assignments</h2>
            <p className="text-sm text-muted-foreground">Latest car check-outs</p>
          </div>
          <Button asChild>
            <Link href="/assignments/new">New Assignment</Link>
          </Button>
        </div>
        <div className="table-wrap">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Car</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>Purpose</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeAssignments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No active assignments
                  </TableCell>
                </TableRow>
              )}
              {activeAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>{assignment.driver}</TableCell>
                  <TableCell>
                    {assignment.plate} - {assignment.make} {assignment.model}
                  </TableCell>
                  <TableCell>{assignment.start_date}</TableCell>
                  <TableCell>{assignment.purpose || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
