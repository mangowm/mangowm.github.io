"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollerLayout } from "./layouts/scroller-layout";
import { TileLayout } from "./layouts/tile-layout";

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function MangowcLayouts() {
	const [activeLayout, setActiveLayout] = useState<"tiling" | "scroller">(
		"tiling",
	);

	return (
		<div className="mx-auto w-full max-w-4xl space-y-4 p-4">
			<div className="flex justify-end">
				<div className="inline-flex rounded-full border border-border bg-muted p-1">
					<button
						type="button"
						onClick={() => setActiveLayout("tiling")}
						className={cn(
							"cursor-pointer rounded-full px-4 py-1.5 font-medium text-sm transition-all",
							activeLayout === "tiling"
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						Tiling
					</button>
					<button
						type="button"
						onClick={() => setActiveLayout("scroller")}
						className={cn(
							"cursor-pointer rounded-full px-4 py-1.5 font-medium text-sm transition-all",
							activeLayout === "scroller"
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						Scroller
					</button>
				</div>
			</div>

			<div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl border border-border bg-background/50 shadow-sm">
				{activeLayout === "tiling" && <TileLayout />}
				{activeLayout === "scroller" && <ScrollerLayout />}
			</div>
		</div>
	);
}
