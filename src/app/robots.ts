import type { MetadataRoute } from "next";
import { buildRelativePath } from "@/utils/basePath";
import { getCanonicalOrigin } from "@/utils/seo";

// Served at /bills/robots.txt.
export default function robots(): MetadataRoute.Robots {
  const origin = getCanonicalOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: buildRelativePath(),
      disallow: [
        buildRelativePath("sign-in"),
        buildRelativePath("unauthorized"),
        `${buildRelativePath("dev")}/`,
        `${buildRelativePath("api")}/`,
        `${buildRelativePath()}/*/edit`,
      ],
    },
    sitemap: `${origin}${buildRelativePath("sitemap.xml")}`,
  };
}
