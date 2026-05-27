import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MJG Dashboard",
  description: "Admin dashboard for The Stewardship Blueprint and Created for More.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
