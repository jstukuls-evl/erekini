import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "erekini — Latvijas e-rēķini",
    template: "%s · erekini",
  },
  description:
    "Latvijas tirgus SaaS e-rēķiniem un vieglai grāmatvedības sagatavošanai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="lv"
      className={`${manrope.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
