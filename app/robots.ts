import { baseUrl } from "lib/utils";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/status/",
          "/modal/",
          "/header/",
          "/encuesta/",
          "/search",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
