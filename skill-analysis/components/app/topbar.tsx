import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";

export default async function Topbar() {
  const user = await getCurrentUser();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="flex items-center gap-6">
          <Link href="/" className="logo">
            Fleet Asset Manager
          </Link>
          {user && (
            <nav className="flex items-center gap-4">
              <Link href="/" className="nav-link">
                Dashboard
              </Link>
              <Link href="/cars" className="nav-link">
                Cars
              </Link>
              <Link href="/assignments" className="nav-link">
                Assignments
              </Link>
              <Link href="/maintenance" className="nav-link">
                Maintenance
              </Link>
              {user.role === "admin" && (
                <Link href="/users" className="nav-link">
                  Users
                </Link>
              )}
            </nav>
          )}
        </div>
        {user ? (
          <form action={logoutAction} className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              {user.name} ({user.role})
            </span>
            <Button size="sm" variant="secondary" type="submit">
              Logout
            </Button>
          </form>
        ) : (
          <Link href="/login" className="nav-link">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
