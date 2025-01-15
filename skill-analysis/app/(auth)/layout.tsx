import Topbar from "@/components/app/topbar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Topbar />
      <main className="container py-12">{children}</main>
    </>
  );
}
