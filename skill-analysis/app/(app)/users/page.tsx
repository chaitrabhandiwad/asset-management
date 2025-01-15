import Link from "next/link";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function UsersPage() {
  await requireRole(["admin"]);
  const users = db
    .prepare("SELECT id, name, email, role, created_at FROM users ORDER BY id DESC")
    .all() as Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
  }>;

  return (
    <section className="section">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage access to the fleet system.</p>
        </div>
        <Button asChild>
          <Link href="/users/new">Add User</Link>
        </Button>
      </div>

      <div className="table-wrap">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  No users yet
                </TableCell>
              </TableRow>
            )}
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>{u.created_at}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
