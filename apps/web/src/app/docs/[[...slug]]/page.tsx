import { createRelativeLink } from "fumadocs-ui/mdx";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from "fumadocs-ui/page";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";
import { LLMCopyButton, ViewOptions } from "@/components/ai/page-actions";

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
					<div className="flex flex-row flex-wrap gap-2 items-center border-b pb-6 -mt-6">
						<LLMCopyButton filePath={`apps/web/content/docs/${page.path}`} />
						<ViewOptions
							markdownUrl={`${page.url}.mdx`}
							githubUrl={`https://github.com/atheeq-rhxn/mangowc-web/blob/main/apps/web/content/docs/${page.path}`}
						/>
					</div>
					<div className="pt-4">
						<MDX
							components={getMDXComponents({
								// this allows you to link to other pages with relative file paths
								a: createRelativeLink(source, page),
							})}
						/>
					</div>
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
