import { existsSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";
import { Poppins, Manrope, Anton } from "next/font/google";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig, getSiteUrl, BUILD_STAMP } from "@/config/site";
import { graph, organisationSchema, webSiteSchema } from "@/config/schema";
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
  /* No `keywords`. Google has not used the meta keywords tag for ranking in
     well over a decade; the work it was pretending to do is done by the
     titles, headings, copy, internal links and structured data instead. */
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_IN",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
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
    images: [siteConfig.ogImage],
  },
  /* Which build this page came out of. Not for crawlers; it is how anyone
     can tell in five seconds whether the page in front of them is the one
     that was last handed over. See BUILD_STAMP. */
  other: { "rs-build": BUILD_STAMP },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
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

  /* The brand and the site, declared once for every page. Both nodes carry a
     stable @id so a page's own Product and Breadcrumb nodes can point at
     them instead of restating them. */
  const siteGraph = graph([
    organisationSchema(hasLogo ? "/assets/brand/logo.png" : undefined),
    webSiteSchema(),
  ]);

  return (
    <html
      /* en-IN, not en: the audience, spelling and currency of this site are
         Indian, and the hreflang a crawler infers from this should say so. */
      lang="en-IN"
      className={`${poppins.variable} ${manrope.variable} ${anton.variable}`}
    >
      <body>
        <JsonLd json={siteGraph} />
        <SmoothScroll>
          <Navigation hasLogo={hasLogo} />
          {children}
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
