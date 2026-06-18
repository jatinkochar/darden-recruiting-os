import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Darden Recruiting OS", description: "MBA recruiting command center." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
