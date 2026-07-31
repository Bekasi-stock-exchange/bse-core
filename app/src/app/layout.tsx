import type { Metadata } from "next";
import "./globals.css";
import BackgroundGradient from "@components/BackgroundGradient";

export const metadata: Metadata = {
  title: "Bekasi Stock Exchange - Next Generation Platform",
  description: "Modern, premium platform built with Next.js and Elysia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen flex flex-col relative">
        <BackgroundGradient />
        {children}
      </body>
    </html>
  );
}
