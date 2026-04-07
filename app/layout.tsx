import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "CreditLens — Your complete credit command centre",
  description: "Multi-card credit management platform fed by iPhone Shortcuts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-[#0f0f13] font-sans antialiased",
          inter.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
