import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aql Digital — Agency OS",
  description: "AI-powered agency command center. Orchestrate agents, manage clients, automate workflows.",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
