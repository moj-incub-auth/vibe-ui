/* eslint-disable @next/next/no-css-tags */

import type { Metadata } from "next";
import "./globals.css";
import GovPhaseBanner from "@/components/GovPhaseBanner";
import GovHeader from "@/components/GovHeader";
import GovFooter from "@/components/GovFooter";

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
    <html lang="en" className="govuk-template">
      <head>
        <link rel="stylesheet" href="/govuk-frontend.min.css" />
        <link rel="stylesheet" href="/assets/css/gov-reuse.css" />
        <script src="/govuk-frontend.min.js" defer />
        <script src="/assets/js/gov-reuse.js" defer type="module" />
      </head>
      <body className="govuk-template__body antialiased">
        <GovPhaseBanner />
        <GovHeader />
        {children}
        <GovFooter />
      </body>
    </html>
  );
}
