import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

const routes = ["/", "/services", "/arta", "/artist", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
