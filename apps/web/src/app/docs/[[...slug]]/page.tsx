import { createRelativeLink } from "fumadocs-ui/mdx";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from "fumadocs-ui/page";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LLMCopyButton, ViewOptions } from "@/components/page-actions";
import { basePath } from "@/lib/base-path";
import {
	baseUrl,
	createMetadata,
	getPageImage,
	SITE_DESCRIPTION,
} from "@/lib/metadata";
import { type Page, source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

export const revalidate = false;

export default async function DocPage(props: PageProps<"/docs/[[...slug]]">) {
	const params = await props.params;
	const page = source.getPage(params.slug);

	if (!page) notFound();

	const {
		body: MDX,
		toc,
		full,
	} = await (
		page.data as {
			load: () => Promise<{ body: any; toc: any; full?: boolean }>;
		}
	).load();

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "Article",
						headline: page.data.title,
						description: page.data.description,
						author: {
							"@type": "Organization",
							name: "MangoWC",
						},
						publisher: {
							"@type": "Organization",
							name: "MangoWC",
						},
						datePublished: new Date().toISOString(),
						dateModified: new Date().toISOString(),
						mainEntityOfPage: {
							"@type": "WebPage",
							"@id": `${baseUrl}/docs/${page.slugs.join("/")}`,
						},
					}),
				}}
			/>
			<DocsPage toc={toc} full={full} tableOfContent={{ style: "clerk" }}>
				<DocsTitle>{page.data.title}</DocsTitle>
				<DocsDescription className="mb-2">
					{page.data.description}
				</DocsDescription>
				<div className="flex flex-row flex-wrap items-center gap-2 border-b pb-8">
					<LLMCopyButton
						markdownUrl={`${basePath}/llms.mdx/docs/${[...page.slugs, "index.mdx"].join("/")}`}
					/>
					<ViewOptions
						markdownUrl={`${basePath}/llms.mdx/docs/${[...page.slugs, "index.mdx"].join("/")}`}
						githubUrl={`https://github.com/atheeq-rhxn/mangowc-web/blob/main/apps/web/content/docs/${page.path}`}
					/>
				</div>
				<div className="prose prose-no-margin flex-1 text-fd-foreground/90">
					<MDX
						components={getMDXComponents({
							// this allows you to link to other pages with relative file paths
							a: createRelativeLink(source, page),
						})}
					/>
				</div>
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
	if (!page)
		return createMetadata({
			title: "Not Found",
		});

	const description = page.data.description ?? SITE_DESCRIPTION;

	const image = {
		url: getPageImage(page).url,
		width: 1200,
		height: 630,
	};

	return createMetadata({
		title: page.data.title,
		description,
		alternates: {
			canonical: `/docs/${page.slugs.join("/")}`,
		},
		openGraph: {
			url: `/docs/${page.slugs.join("/")}`,
			images: [image],
		},
		twitter: {
			images: [image],
		},
	});
}
