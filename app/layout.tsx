import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";

import { cn } from "@/lib/utils";

import "./globals.css";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontDisplay = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "No-show outreach | clinicalQ",
  description:
    "Prioritized call queue to help care coordinators reduce appointment no-shows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(fontSans.variable, fontDisplay.variable)}>
      <body className="min-h-screen font-sans antialiased">
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast:
                "rounded-xl border border-slate-200/80 shadow-lg bg-white/95 backdrop-blur-md dark:bg-slate-900/95 dark:border-white/10",
            },
          }}
        />
      </body>
    </html>
  );
}
