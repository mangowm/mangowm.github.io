import type { Metadata } from "next/types";
import { basePath } from "./base-path";
import type { Page } from "./source";

const IMAGE_VERSION = "4";

export function createMetadata(override: Metadata): Metadata {
	return {
		metadataBase: baseUrl,
		keywords: [
			"wayland compositor",
			"window manager",
			"dwl",
			"linux",
			"lightweight wm",
			"wlroots",
			"scenefx",
			"tiling window manager",
			"dynamic tiling",
		],
		icons: {
			icon: `${basePath}/favicon.ico`,
			apple: `${basePath}/logo-192x192.webp`,
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-image-preview": "large",
				"max-snippet": -1,
				"max-video-preview": -1,
			},
		},
		category: "Software",
		...override,
		openGraph: {
			title: override.title ?? undefined,
			description: override.description ?? undefined,
			url: "https://mangowc.vercel.app",
			images: `/banner.webp?v=${IMAGE_VERSION}`,
			siteName: "MangoWC",
			locale: "en_US",
			type: "website",
			...override.openGraph,
		},
		twitter: {
			card: "summary_large_image",
			title: override.title ?? undefined,
			description: override.description ?? undefined,
			images: `/banner.webp?v=${IMAGE_VERSION}`,
			...override.twitter,
		},
		alternates: {
			types: {
				"application/rss+xml": [
					{
						title: "MangoWC Updates",
						url: "https://mangowc.vercel.app/rss.xml",
					},
				],
			},
			...override.alternates,
		},
	};
}

export function getPageImage(page: Page) {
	const segments = [...page.slugs, "image.webp"];

	return {
		segments,
		url: `/og/${segments.join("/")}`,
	};
}

export const SITE_DESCRIPTION =
	"MangoWC is a fast, lightweight, modern Wayland compositor.";

export const baseUrl =
	process.env.NODE_ENV === "development"
		? new URL("http://localhost:3001")
		: new URL("https://atheeq-rhxn.github.io" + basePath);

export const githubPagesBasePath = "/mangowc-web";
