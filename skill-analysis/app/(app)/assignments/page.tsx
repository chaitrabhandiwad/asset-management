import Link from "next/link";
import db from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { returnAssignmentAction } from "@/app/actions/assignments";

export default async function AssignmentsPage() {
  const user = await requireUser();
  const assignments = db
    .prepare(
      `SELECT a.*, c.plate, c.make, c.model, u.name AS driver
       FROM assignments a
       JOIN cars c ON c.id = a.car_id
       JOIN users u ON u.id = a.user_id
       ORDER BY a.start_date DESC`
    )
    .all() as Array<{
    id: number;
    start_date: string;
    end_date: string | null;
    purpose: string | null;
    plate: string;
    make: string;
    model: string;
    driver: string;
  }>;

  return (
    <section className="section">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Assignments</h1>
          <p className="text-sm text-muted-foreground">Check-out history and returns.</p>
        </div>
        {(user.role === "admin" || user.role === "manager") && (
          <Button asChild>
            <Link href="/assignments/new">New Assignment</Link>
          </Button>
        )}
      </div>

      <div className="table-wrap">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver</TableHead>
              <TableHead>Car</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  No assignments yet
                </TableCell>
              </TableRow>
            )}
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>{assignment.driver}</TableCell>
                <TableCell>
                  {assignment.plate} - {assignment.make} {assignment.model}
                </TableCell>
                <TableCell>{assignment.start_date}</TableCell>
                <TableCell>{assignment.end_date || "-"}</TableCell>
                <TableCell>{assignment.purpose || "-"}</TableCell>
                <TableCell>
                  {!assignment.end_date && (user.role === "admin" || user.role === "manager") && (
                    <form action={returnAssignmentAction.bind(null, assignment.id)}>
                      <Button size="sm" variant="secondary" type="submit">
                        Return
                      </Button>
                    </form>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
