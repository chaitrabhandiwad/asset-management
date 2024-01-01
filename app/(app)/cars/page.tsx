import Link from "next/link";
import db from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function CarsPage() {
  const user = await requireUser();
  const cars = db
    .prepare(
      `SELECT c.*, a.user_id, u.name AS driver
       FROM cars c
       LEFT JOIN assignments a ON a.car_id = c.id AND a.end_date IS NULL
       LEFT JOIN users u ON u.id = a.user_id
       ORDER BY c.id DESC`
    )
    .all() as Array<{
    id: number;
    plate: string;
    make: string;
    model: string;
    year: number;
    status: "available" | "assigned" | "maintenance" | "retired";
    location: string | null;
    driver: string | null;
  }>;

  return (
    <section className="section">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Cars</h1>
          <p className="text-sm text-muted-foreground">Fleet inventory and status.</p>
        </div>
        {(user.role === "admin" || user.role === "manager") && (
          <Button asChild>
            <Link href="/cars/new">Add Car</Link>
          </Button>
        )}
      </div>

      <div className="table-wrap">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plate</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  No cars yet
                </TableCell>
              </TableRow>
            )}
            {cars.map((car) => (
              <TableRow key={car.id}>
                <TableCell>
                  <Link href={`/cars/${car.id}`} className="text-primary hover:underline">
                    {car.plate}
                  </Link>
                </TableCell>
                <TableCell>
                  {car.year} {car.make} {car.model}
                </TableCell>
                <TableCell>
                  <Badge variant={car.status}>{car.status}</Badge>
                </TableCell>
                <TableCell>{car.driver || "-"}</TableCell>
                <TableCell>{car.location || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
