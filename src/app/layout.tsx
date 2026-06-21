import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veranstaltungsprogramm",
  description: "Webversion des Veranstaltungsprogramms"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <title>{metadata.title as string}</title>
        <meta name="description" content={metadata.description as string} />
      </head>
      <body>{children}</body>
    </html>
  );
}
