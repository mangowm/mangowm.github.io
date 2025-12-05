import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
	return {
		...defaultMdxComponents,
		h1: ({ children, ...props }) => (
			<h1 className="mt-0" {...props}>
				{children}
			</h1>
		),
		h2: ({ children, ...props }) => (
			<h2 className="mt-0" {...props}>
				{children}
			</h2>
		),
		h3: ({ children, ...props }) => (
			<h3 className="mt-0" {...props}>
				{children}
			</h3>
		),
		h4: ({ children, ...props }) => (
			<h4 className="mt-0" {...props}>
				{children}
			</h4>
		),
		p: ({ children, ...props }) => (
			<p className="mt-0" {...props}>
				{children}
			</p>
		),
		...components,
	};
}
