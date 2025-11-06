import { createRelativeLink } from "fumadocs-ui/mdx";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from "fumadocs-ui/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
	const params = await props.params;
	const page = source.getPage(params.slug);
	if (!page) notFound();

	const MDX = page.data.body;

	return (
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
						href={`https://github.com/atheeq-rhxn/mangowc-web/blob/main/apps/web/content/docs/${page.path}.mdx`}
						rel="noreferrer noopener"
						target="_blank"
					>
						<Pencil className="w-4 h-4" />
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

	return {
		title: page.data.title,
		description: page.data.description,
	};
}
