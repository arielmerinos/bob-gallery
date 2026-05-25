import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BoB Media Gallery",
  description: "Battle of Bats — internal media gallery",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
