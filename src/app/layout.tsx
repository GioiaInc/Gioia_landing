import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "belo — by GIOIA",
  description: "A messaging app built around ambient AI. Lightweight sentiment models process everything on-device, in real time.",
  keywords: ["belo", "GIOIA", "messaging", "ambient AI", "communication platform", "Central Asia"],
  authors: [{ name: "GIOIA" }],
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "belo — by GIOIA",
    description: "A messaging app built around ambient AI. 93% of communication is paralinguistic. Current messaging captures none of it.",
    type: "website",
    images: [
      {
        url: "/images/og-preview.png",
        width: 1200,
        height: 630,
        alt: "belo by GIOIA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "belo — by GIOIA",
    description: "A messaging app built around ambient AI. 93% of communication is paralinguistic. Current messaging captures none of it.",
    images: ["/images/og-preview.png"],
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
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
