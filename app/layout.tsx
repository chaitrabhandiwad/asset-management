import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fleet Asset Manager",
  description: "Fleet asset management system for company cars."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="page-shell">{children}</div>
      </body>
    </html>
  );
}
