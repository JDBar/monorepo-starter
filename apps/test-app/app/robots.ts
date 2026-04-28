import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: { userAgent: "*", disallow: ["/"] }, // TODO: Change to allow all when we have more content
		sitemap: "https://example.com/sitemap.xml",
	};
}

export const dynamic = "error";
