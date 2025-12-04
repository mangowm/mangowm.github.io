import { createRelativeLink } from "fumadocs-ui/mdx";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from "fumadocs-ui/page";
import { Pencil } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
	const params = await props.params;
	const page = source.getPage(params.slug);
	if (!page) notFound();

	const MDX = page.data.body;

	const baseUrl = "https://mangowc.vercel.app";
	const pathname = `/docs/${params.slug?.join("/") || ""}`;

	const jsonLdArticle = {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: page.data.title,
		description: page.data.description,
		url: `${baseUrl}${pathname}`,
		publisher: { "@type": "Organization", name: "MangoWC" },
		datePublished: new Date().toISOString(),
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
			/>
			<DocsPage
				toc={page.data.toc}
				full={page.data.full}
				tableOfContent={{ style: "clerk" }}
			>
				<DocsTitle>{page.data.title}</DocsTitle>
				<DocsDescription>{page.data.description}</DocsDescription>
				<DocsBody>
					<Button asChild variant="outline" size="sm">
						<a
							href={`https://github.com/atheeq-rhxn/mangowc-web/blob/main/apps/web/content/docs/${page.path}`}
							rel="noreferrer noopener"
							target="_blank"
						>
							<Pencil className="h-4 w-4" />
							Edit
						</a>
					</Button>
					<MDX
						components={getMDXComponents({
							// this allows you to link to other pages with relative file paths
							a: createRelativeLink(source, page),
						})}
					/>
				</DocsBody>
			</DocsPage>
		</>
	);
}

export async function generateStaticParams() {
	return source.generateParams();
}

export async function generateMetadata(
	props: PageProps<"/docs/[[...slug]]">,
): Promise<Metadata> {
	const params = await props.params;
	const page = source.getPage(params.slug);
	if (!page) notFound();

	const baseUrl = "https://mangowc.vercel.app";
	const pathname = `/docs/${params.slug?.join("/") || ""}`;
	const ogImage = "/image.webp?v=3";

	return {
		title: page.data.title,
		description: page.data.description,
		openGraph: {
			title: page.data.title,
			description: page.data.description,
			url: `${baseUrl}${pathname}`,
			siteName: "MangoWC",
			images: [{ url: `${baseUrl}${ogImage}`, alt: page.data.title }],
			type: "article",
		},
		twitter: {
			card: "summary_large_image",
			title: page.data.title,
			description: page.data.description,
			images: [`${baseUrl}${ogImage}`],
		},
		alternates: { canonical: `${baseUrl}${pathname}` },
	};
}
