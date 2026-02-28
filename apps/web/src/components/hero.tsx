"use client";

import Link from "next/link";
import { MangowcLayouts } from "@/components/mangowc-layouts";
import { basePath } from "@/lib/base-path";

export function Hero() {
	return (
		// 1. Changed min-h to screen for full height
		// 2. Added -mt-16 (negative top margin) to offset the fixed header height so content is optically centered
		<section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-20 sm:px-6 lg:px-10">
			{/* Refactored Grid Background:
                - Removed the separate overlay div
                - Added [mask-image] for a perfect smooth fade to the bottom
            */}
			<div className="grid-bg pointer-events-none absolute inset-0 bg-[size:3rem_3rem] [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]" />

			<div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-14 lg:flex-row lg:items-center lg:gap-20">
				{/* Left Column */}
				<div className="flex-1 text-center lg:text-left">
					<div className="mb-5 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
						<span className="font-mono font-semibold text-primary text-xs sm:text-sm">
							Wayland Compositor
						</span>
					</div>

					<h1 className="mb-6 text-balance font-bold text-4xl text-foreground leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
						Lightweight, <span className="text-primary">Feature-Rich</span>
					</h1>

					<p className="mx-auto mb-10 max-w-xl text-balance text-base text-muted-foreground sm:text-lg md:text-xl lg:mx-0">
						MangoWC is a modern, lightweight, high-performance Wayland
						compositor built on dwl — crafted for speed, flexibility, and a
						customizable desktop experience.
					</p>

					{/* Buttons */}
					<div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
						<Link
							href="/docs/installation"
							className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.04] hover:opacity-90"
						>
							Get Started
						</Link>

						<Link
							href="https://github.com/DreamMaoMao/mangowc"
							target="_blank"
							rel="noopener noreferrer"
							className="rounded-full border border-border bg-background/60 px-8 py-3 font-semibold text-foreground backdrop-blur-md transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							View on GitHub
						</Link>
					</div>
				</div>

				{/* Right Column */}
				<div className="w-full flex-1 lg:max-w-[55%]">
					<div className="w-full">
						<MangowcLayouts />
					</div>
				</div>
			</div>
		</section>
	);
}
