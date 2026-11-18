import type { MetadataRoute } from "next";

export const dynamic = "force-static";
import { profile } from "@/content/profile";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${profile.site}/sitemap.xml`,
  };
}
