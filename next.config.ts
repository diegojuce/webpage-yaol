export default {
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
