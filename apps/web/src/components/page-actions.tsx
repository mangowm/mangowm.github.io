"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
interface PageActionsProps {
	filePath: string;
	username?: string;
	repo?: string;
	branch?: string;
}

const contentCache = new Map<string, string>();

export function PageActions({
	filePath,
	username = "atheeq-rhxn",
	repo = "mangowc-web",
	branch = "main",
}: PageActionsProps) {
	const [copied, setCopied] = useState(false);
	const [loading, setLoading] = useState(false);

	// Construct URLs
	const githubUrl = `https://github.com/${username}/${repo}/blob/${branch}/${filePath}`;
	const rawUrl = `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${filePath}`;

	const fetchContent = async () => {
		if (contentCache.has(rawUrl)) {
			return contentCache.get(rawUrl)!;
		}
		try {
			const res = await fetch(rawUrl);
			if (!res.ok) throw new Error("Failed to fetch content");
			const content = await res.text();
			contentCache.set(rawUrl, content);
			return content;
		} catch (err) {
			console.error(err);
			return null;
		}
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	const handleCopyMarkdown = async () => {
		setLoading(true);
		const content = await fetchContent();
		setLoading(false);
		if (content) await copyToClipboard(content);
	};

	const handleOpenInAI = async (url: string) => {
		setLoading(true);
		const content = await fetchContent();
		setLoading(false);
		if (content) {
			await copyToClipboard(content);
			setTimeout(() => window.open(url, "_blank"), 100);
		}
	};

	return (
		<div className="flex items-center gap-2">
			<Button variant="outline" size="sm" asChild>
				<a
					href={githubUrl}
					target="_blank"
					rel="noreferrer"
					className="gap-2 no-underline"
				>
					<Github className="size-4" />
					Edit on GitHub
				</a>
			</Button>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="text-muted-foreground"
						disabled={loading}
					>
						{copied ? (
							<Check className="size-4" />
						) : loading ? (
							<div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
						) : (
							<Copy className="size-4" />
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={handleCopyMarkdown}>
						<Copy className="mr-2 size-4" />
						Copy Markdown
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => handleOpenInAI("https://claude.ai/new")}
					>
						<ExternalLink className="mr-2 size-4" />
						Ask Claude
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => handleOpenInAI("https://chatgpt.com/")}
					>
						<ExternalLink className="mr-2 size-4" />
						Ask ChatGPT
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
