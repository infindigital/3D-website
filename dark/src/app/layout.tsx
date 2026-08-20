import { existsSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";
import { Poppins, Manrope, Anton } from "next/font/google";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { siteConfig, getSiteUrl } from "@/config/site";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/**
 * The signage face: heavy, condensed, and only ever set in caps. It carries
 * the navigation, the hero's buttons and the giant words drifting behind
 * the film — the places the site has to read like a restaurant sign rather
 * than like body copy. Everything else stays on Poppins and Manrope.
 */
const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "RS Chefz",
    "masala",
    "Gobi Manchurian Masala",
    "3 in 1 Masala",
    "Chicken 65",
    "Fish Fry",
    "restaurant style masala",
    "Indian spices",
  ],
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} masala packs`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The owner-supplied logo replaces the styled wordmark once it lands
  const hasLogo = existsSync(
    join(process.cwd(), "public", "assets", "brand", "logo.png"),
  );

  return (
    <html
      lang="en"
      className={`${poppins.variable} ${manrope.variable} ${anton.variable}`}
    >
      <body>
        <SmoothScroll>
          <Navigation hasLogo={hasLogo} />
          {children}
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
