import type { MetadataRoute } from "next";
import { source } from "@/lib/source";

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = "https://mangowc.vercel.app";

	const docsPages = source.getPages().map((page) => ({
		url: `${baseUrl}/docs/${page.slugs.join("/")}`,
		lastModified: new Date(),
		changeFrequency: "monthly" as const,
		priority: 0.8,
	}));

	return [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 1,
		},
		...docsPages,
	];
}
