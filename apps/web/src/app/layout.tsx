import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../index.css";
import { AppProviders } from "@/components/app-providers";
import Providers from "@/components/providers";
import { basePath } from "@/lib/base-path";
import { createMetadata, SITE_DESCRIPTION } from "@/lib/metadata";

const SITE_TITLE = "MangoWC - Lightweight Wayland Compositor";
const SITE_URL = "https://mangowc.vercel.app";
const SITE_OG_IMAGE = `${basePath}/image.webp`;
const IMAGE_VERSION = "3";
const TWITTER_CREATOR = "";

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

const jsonLdSoftware = {
	"@context": "https://schema.org",
	"@type": "SoftwareApplication",
	name: "MangoWC",
	alternateName: "Mango Window Compositor",
	description: SITE_DESCRIPTION,
	applicationCategory: "DesktopEnhancementApplication",
	operatingSystem: "Linux",
	programmingLanguage: "C",
	softwareVersion: "latest",
	url: SITE_URL,
	codeRepository: "https://github.com/DreamMaoMao/mangowc",
	downloadUrl: "https://github.com/DreamMaoMao/mangowc/releases",
	license: "https://github.com/DreamMaoMao/mangowc/blob/main/LICENSE",
	author: {
		"@type": "Person",
		name: "DreamMaoMao",
		url: "https://github.com/DreamMaoMao",
	},
	sameAs: ["https://github.com/DreamMaoMao/mangowc", SITE_URL],
	keywords: [
		"wayland compositor",
		"dwl",
		"linux window manager",
		"lightweight wm",
		"tiling compositor",
	],
};

const jsonLdOrganization = {
	"@context": "https://schema.org",
	"@type": "Organization",
	name: "MangoWC",
	url: SITE_URL,
	logo: `${SITE_URL}/favicon/web-app-manifest-512x512.webp`,
	sameAs: ["https://github.com/DreamMaoMao/mangowc"],
};

export const metadata = createMetadata({
	title: {
		template: "%s | MangoWC",
		default: "MangoWC",
	},
	description: SITE_DESCRIPTION,
	openGraph: {
		images: "/banner.webp",
	},
	twitter: {
		images: "/banner.webp",
	},
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${geist.className} ${geistMono.className}`}
		>
			<body className="flex min-h-screen flex-col font-sans antialiased">
				<a
					href="#main"
					className="sr-only z-50 rounded bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
				>
					Skip to main content
				</a>
				<AppProviders>
					<Providers>{children}</Providers>
				</AppProviders>
				<Analytics />
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftware) }}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(jsonLdOrganization),
					}}
				/>
			</body>
		</html>
	);
}
