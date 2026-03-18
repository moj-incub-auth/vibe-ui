import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GOV Route Library",
  description: "Describe a user need. Discover the right component.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
