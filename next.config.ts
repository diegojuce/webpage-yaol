export default {
  // El bloqueo de pago (lib/commerce-status.ts) necesita saber en el navegador
  // si es el deploy de producción.
  env: {
    NEXT_PUBLIC_VERCEL_ENV:
      process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV ?? "",
  },
  experimental: {
    ppr: true,
    inlineCss: true,
    useCache: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "**", pathname: "/**" }],
  },
  async redirects() {
    return [
      {
        source: "/promo-colinas",
        destination: "https://stg-back.yantissimo.com/qr/promo/colinas",
        permanent: false,
      },
    ];
  },
};
