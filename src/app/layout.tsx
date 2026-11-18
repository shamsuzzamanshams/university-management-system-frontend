import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
export const metadata: Metadata = {
  title: "UniNexus | University Management",
  description: "UniNexus connects academic services and campus operations in one workspace.",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><Providers>{children}</Providers></body></html>; }
