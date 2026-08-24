import type { Metadata } from "next";
import { Inter, Jost, Cormorant_Garamond } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export const metadata: Metadata = {
  title: "VenueConnect | Book Wedding & Event Venues in Gujarat",
  description: "Find and book the best wedding venues, banquet halls, party plots & event spaces in Gujarat. Compare prices, capacity, catering options in Ahmedabad, Surat, Rajkot, Vadodara and across Gujarat.",
  keywords: "wedding venues Gujarat, banquet hall Ahmedabad, party plot Surat, event venue Rajkot, marriage hall Vadodara, farmhouse wedding Gujarat, corporate event venue Gujarat, birthday party venues Gujarat, wedding reception hall, venue booking Gujarat",
   authors: [{ name: "VenueConnect" }],
   robots: "index, follow",
   icons: {
     icon: "/favicon.svg",
     apple: "/favicon.svg",
   },
  alternates: {
    canonical: "https://venueconnect.in/",
  },
  other: {
    "geo.region": "IN-GJ",
    "geo.placename": "Gujarat, India",
  },
  openGraph: {
    type: "website",
    url: "https://venueconnect.in/",
    title: "VenueConnect – Best Wedding & Event Venues in Gujarat",
    description: "Discover and book premium wedding venues, banquet halls and party plots across Gujarat. Venues in Ahmedabad, Surat, Rajkot, Vadodara and 50+ cities.",
    siteName: "VenueConnect",
    images: [
      {
        url: "https://venueconnect.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VenueConnect – Wedding Venues in Gujarat",
      },
    ],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    site: "@VenueConnect",
    title: "VenueConnect – Book Event Venues in Gujarat",
    description: "Find the perfect wedding hall, banquet, farmhouse or party plot in Gujarat.",
    images: ["https://venueconnect.in/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-WFF6M8CS');`}
        </Script>

        {/* Google tag (gtag.js) */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-8X89D92S67" 
          strategy="afterInteractive" 
        />
        <Script id="ga4-script" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8X89D92S67');`}
        </Script>

        {/* Schema.org - WebSite */}
        <Script id="schema-website" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "VenueConnect",
            "url": "https://venueconnect.in",
            "description": "Gujarat's premier venue discovery and booking platform for weddings, corporate events, and celebrations.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://venueconnect.in/venues?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })}
        </Script>

        {/* Schema.org - Organization */}
        <Script id="schema-org" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "VenueConnect",
            "url": "https://venueconnect.in",
            "logo": "https://venueconnect.in/logo.webp",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+91-9586500686",
              "contactType": "customer service",
              "availableLanguage": ["English", "Gujarati", "Hindi"]
            },
            "areaServed": {
              "@type": "State",
              "name": "Gujarat",
              "addressCountry": "IN"
            },
            "sameAs": [
              "https://www.instagram.com/venueconnect.in/",
              "https://www.facebook.com/venueconnect.in"
            ]
          })}
        </Script>
      </head>
      <body className={`${jost.variable} ${cormorantGaramond.variable} antialiased font-sans`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-WFF6M8CS" 
            height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <Navbar />
        <main className="min-h-screen pb-16 md:pb-0">
          {children}
        </main>
        <Footer />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
