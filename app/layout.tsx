import { CartProvider } from "components/cart/cart-context";
import HomepageLoaderGate from "components/home/homepage-loader-gate";
import { HideOnPathPrefixes } from "components/layout/hide-on-path-prefixes";
import { Navbar } from "components/layout/navbar";
import { WelcomeToast } from "components/welcome-toast";
import { BRANCHES, COMPANY, SOCIALS } from "lib/company";
import { getCart } from "lib/shopify";
import { baseUrl } from "lib/utils";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";

const { SITE_NAME } = process.env;

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SITE_NAME!,
    template: `%s`,
  },
  robots: {
    follow: true,
    index: true,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${COMPANY.website}/#organization`,
      name: COMPANY.legalName,
      alternateName: "Yantissimo Llantas",
      url: COMPANY.website,
      logo: `${COMPANY.website}/logo.svg`,
      foundingDate: COMPANY.foundedDate,
      email: COMPANY.email,
      sameAs: SOCIALS.map((s) => s.href),
      areaServed: [
        { "@type": "City", name: "Colima" },
        { "@type": "City", name: "Villa de Álvarez" },
        { "@type": "City", name: "Manzanillo" },
        { "@type": "State", name: "Colima" },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.5",
        bestRating: "5",
        ratingCount: "1200",
        reviewCount: "1200",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${COMPANY.website}/#website`,
      url: COMPANY.website,
      name: COMPANY.brandName,
      inLanguage: "es-MX",
      publisher: { "@id": `${COMPANY.website}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${COMPANY.website}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "AutoPartsStore",
      "@id": `${COMPANY.website}/#localbusiness`,
      name: `${COMPANY.legalName} — Llantera en Colima`,
      url: COMPANY.website,
      image: `${COMPANY.website}/opengraph-image`,
      logo: `${COMPANY.website}/logo.svg`,
      priceRange: "$$",
      currenciesAccepted: "MXN",
      paymentAccepted: "Cash, Credit Card, Debit Card",
      telephone: "+525213122220099",
      address: {
        "@type": "PostalAddress",
        streetAddress: COMPANY.hqAddress.street,
        addressLocality: COMPANY.hqAddress.city,
        addressRegion: COMPANY.hqAddress.state,
        postalCode: COMPANY.hqAddress.postalCode,
        addressCountry: COMPANY.hqAddress.country,
      },
      areaServed: [
        { "@type": "City", name: "Colima" },
        { "@type": "City", name: "Villa de Álvarez" },
        { "@type": "City", name: "Manzanillo" },
      ],
      department: BRANCHES.map((b) => ({
        "@type": "AutoRepair",
        "@id": `${COMPANY.website}/ubicaciones#${b.id}`,
        name: `Yantissimo ${b.name}`,
        telephone: `+52${b.phone.replace(/\s/g, "")}`,
        address: {
          "@type": "PostalAddress",
          streetAddress: b.address,
          addressLocality: b.city,
          addressRegion: b.state,
          postalCode: b.zip,
          addressCountry: "MX",
        },
      })),
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.5",
        bestRating: "5",
        ratingCount: "1200",
        reviewCount: "1200",
      },
    },
  ],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Don't await the fetch, pass the Promise to the context provider
  const cart = getCart();

  return (
    <html lang="es">
      <body className="bg-[#0f0f0f] text-white selection:bg-teal-300 dark:bg-[#0f0f0f] dark:text-white dark:selection:bg-pink-500 dark:selection:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <CartProvider cartPromise={cart}>
          <HomepageLoaderGate>
            <HideOnPathPrefixes prefixes={["/encuesta"]}>
              <Navbar />
            </HideOnPathPrefixes>
            <main>
              {children}
              <Toaster closeButton />
              <HideOnPathPrefixes prefixes={["/encuesta"]}>
                <WelcomeToast />
              </HideOnPathPrefixes>
            </main>
          </HomepageLoaderGate>
        </CartProvider>
      </body>
    </html>
  );
}
