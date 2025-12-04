"use client";

import Link from "next/link";
import { MangowcLayouts } from "@/components/mangowc-layouts";

export function Hero() {
	return (
		<section className="relative flex min-h-screen items-center overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
			{/* Background grid effect */}
			<div className="grid-bg pointer-events-none absolute inset-0 bg-[size:4rem_4rem]" />

			<div className="relative z-10 flex w-full max-w-7xl mx-auto items-center gap-8">
				<div className="flex-1 text-center">
					<div className="mb-6 inline-block">
						<span className="font-mono font-semibold text-primary text-sm">
							Wayland Compositor
						</span>
					</div>

					<h1 className="mb-6 text-balance font-bold text-5xl text-foreground leading-tight sm:text-6xl lg:text-7xl">
						Lightweight, <span className="text-primary">Feature-Rich</span>
					</h1>

					<p className="mx-auto mb-12 max-w-2xl text-balance text-foreground/70 text-lg sm:text-xl">
						MangoWC is a lightweight, high-performance Wayland compositor built
						on dwl, designed for speed, flexibility, and a modern, customizable
						desktop experience.
					</p>

					<div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
						<Link
							href="https://github.com/DreamMaoMao/mangowc"
							target="_blank"
							rel="noopener noreferrer"
							className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
						>
							View on GitHub
						</Link>
						<Link
							href="https://discord.gg/CPjbDxesh5"
							target="_blank"
							rel="noopener noreferrer"
							className="rounded-full border border-border px-8 py-3 font-semibold text-foreground transition-colors hover:bg-card"
						>
							Join Discord
						</Link>
					</div>
				</div>
				<div className="flex-1 flex justify-center">
					<MangowcLayouts />
				</div>
			</div>
		</section>
	);
}
