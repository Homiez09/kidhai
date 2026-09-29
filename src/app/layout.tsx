import type { Metadata, Viewport } from "next";
import { Google_Sans, Google_Sans_Code } from "next/font/google";
// โฆษณา AdSense ปิดชั่วคราว — เปิดคืนโดยเอา comment ออก (ตัวคอมโพเนนต์ยังอยู่ที่ src/components/ads/AdSlot.tsx)
// import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { AppToaster } from "@/components/theme/AppToaster";
import { Providers } from "@/components/theme/Providers";
// import { ADSENSE_CLIENT_ID, ADSENSE_ENABLED, SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import "./globals.css";

// subset "thai" จำเป็นเพราะเนื้อหาเกือบทั้งเว็บเป็นภาษาไทย
const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Google Sans Code ไม่มี subset ไทย แต่ใช้กับเลขบัตร/JSON/ชื่อไฟล์ซึ่งเป็น latin ล้วน
const googleSansCode = Google_Sans_Code({
  variable: "--font-google-sans-code",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  // โฆษณา AdSense ปิดชั่วคราว — เปิดคืนโดยเอา comment ออก (ตัวคอมโพเนนต์ยังอยู่ที่ src/components/ads/AdSlot.tsx)
  // ...(ADSENSE_ENABLED ? { other: { "google-adsense-account": ADSENSE_CLIENT_ID } } : {}),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f3f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a10" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any (Web Browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
  inLanguage: "th",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={`${googleSans.variable} ${googleSansCode.variable}`}
    >
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <InitColorSchemeScript attribute="data-mui-color-scheme" defaultMode="dark" />
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <Providers>
            {children}
            <AppToaster />
          </Providers>
        </AppRouterCacheProvider>

        {/* โฆษณา AdSense ปิดชั่วคราว — เปิดคืนโดยเอา comment ออก */}
        {/*
        {ADSENSE_ENABLED && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        */}

        <Analytics />
      </body>
    </html>
  );
}
