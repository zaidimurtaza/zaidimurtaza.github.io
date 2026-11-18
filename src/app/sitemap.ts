import type { MetadataRoute } from "next";

export const dynamic = "force-static";
import { profile } from "@/content/profile";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: profile.site, changeFrequency: "monthly", priority: 1 }];
}
