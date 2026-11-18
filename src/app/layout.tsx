import type { Metadata, Viewport } from "next";
import { Newsreader, Schibsted_Grotesk } from "next/font/google";
import { profile } from "@/content/profile";
import "./globals.css";

const serif = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal"],
  display: "swap",
});

const sans = Schibsted_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const title = "Murtaza Zaidi, full-stack AI engineer and founder";
const description =
  "Murtaza Zaidi builds AI products end to end: healthcare voice agents at a YC-backed startup, his own SaaS products DM IQ and BrandOye, and production builds for founders in New York, Zurich, Dubai and Barcelona.";

export const metadata: Metadata = {
  metadataBase: new URL(profile.site),
  title: { default: title, template: "%s, Murtaza Zaidi" },
  description,
  alternates: { canonical: "/" },
  authors: [{ name: profile.name, url: profile.site }],
  keywords: [
    "Murtaza Zaidi",
    "Mohd Murtaza",
    "full-stack AI engineer",
    "AI agents",
    "Next.js developer",
    "SaaS founder",
    "DM IQ",
    "BrandOye",
    "freelance AI developer",
  ],
  openGraph: {
    type: "profile",
    title,
    description,
    url: "/",
    siteName: profile.name,
    images: [{ url: "/murtaza.jpg", width: 400, height: 400, alt: profile.name }],
  },
  twitter: { card: "summary", title, description, images: ["/murtaza.jpg"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f1f1ec",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
