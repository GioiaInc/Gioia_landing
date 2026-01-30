import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GIOIA | balo - Building AI infrastructure through exceptional design",
  description: "GIOIA reimagines digital products with design and user experience as the foundation. Our first product, balo, is a new communication platform built to bridge the nonverbal gap.",
  keywords: ["GIOIA", "balo", "AI infrastructure", "communication platform", "Central Asia", "digital design"],
  authors: [{ name: "GIOIA" }],
  openGraph: {
    title: "GIOIA | balo",
    description: "Building AI infrastructure through exceptional design",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
