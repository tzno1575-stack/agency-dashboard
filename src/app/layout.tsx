import type { Metadata, Viewport } from "next";
import ClientLayout from "./ClientLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aql Digital — Agency OS",
  description: "AI-powered agency command center. Orchestrate agents, manage clients, automate workflows.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Aql Digital" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased"><ClientLayout>{children}</ClientLayout></body>
    </html>
  );
}
