import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Private Photo Album",
  description: "Share private photo albums with Google Drive integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
