"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
	CARD_ACTIVE,
	CARD_BASE,
	CARD_INACTIVE,
	TIMINGS,
	TOTAL_DURATION,
} from "./constants";

// ============================================================================
// 1. TILING LAYOUT
// ============================================================================
export function TileLayout() {
	const containerRef = useRef<HTMLDivElement>(null);
	const r1 = useRef<HTMLDivElement>(null);
	const r2 = useRef<HTMLDivElement>(null);
	const r3 = useRef<HTMLDivElement>(null);

	const [phase, setPhase] = useState(0);
	const [loopKey, setLoopKey] = useState(0);

	// Setup Transitions
	useEffect(() => {
		[r1, r2, r3].forEach((ref) => {
			if (ref.current) {
				// Optimization: Unified transition string
				ref.current.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
			}
		});
	}, []);

	// Main Logic
	useEffect(() => {
		const update = () => {
			if (!containerRef.current) return;
			const width = containerRef.current.clientWidth;
			const height = containerRef.current.clientHeight;
			const gap = 16;

			const halfW = (width - gap) / 2;
			const halfH = (height - gap) / 2;
			const rightX = halfW + gap;
			const bottomY = halfH + gap;

			const set = (
				el: HTMLDivElement | null,
				x: number,
				y: number,
				w: number,
				h: number,
				visible: boolean,
				active: boolean,
			) => {
				if (!el) return;
				el.style.left = `${x}px`;
				el.style.top = `${y}px`;
				el.style.width = `${w}px`;
				el.style.height = `${h}px`;

				el.style.opacity = visible ? "1" : "0";
				el.style.transform = visible ? "scale(1)" : "scale(0.9)";

				// Optimization: Use pre-defined classes to reduce string interpolation overhead
				el.className = cn(CARD_BASE, active ? CARD_ACTIVE : CARD_INACTIVE);
			};

			// Layout Phases
			if (phase === 0) {
				// Init
				set(r1.current, 0, 0, width, height, false, false);
				set(r2.current, rightX, 0, halfW, height, false, false);
				set(r3.current, rightX, bottomY, halfW, halfH, false, false);
			} else if (phase === 1) {
				// Spawn 1
				set(r1.current, 0, 0, width, height, true, true);
				set(r2.current, rightX, 0, halfW, height, false, false);
				set(r3.current, rightX, bottomY, halfW, halfH, false, false);
			} else if (phase === 2) {
				// Spawn 2
				set(r1.current, 0, 0, halfW, height, true, false);
				set(r2.current, rightX, 0, halfW, height, true, true);
				set(r3.current, rightX, bottomY, halfW, halfH, false, false);
			} else if (phase === 3) {
				// Spawn 3
				set(r1.current, 0, 0, halfW, height, true, false);
				set(r2.current, rightX, 0, halfW, halfH, true, false);
				set(r3.current, rightX, bottomY, halfW, halfH, true, true);
			} else if (phase === 4) {
				// Swap
				set(r1.current, rightX, bottomY, halfW, halfH, true, false);
				set(r2.current, rightX, 0, halfW, halfH, true, false);
				set(r3.current, 0, 0, halfW, height, true, true);
			} else if (phase === 5) {
				// Re-Swap
				set(r1.current, 0, 0, halfW, height, true, true);
				set(r2.current, rightX, 0, halfW, halfH, true, false);
				set(r3.current, rightX, bottomY, halfW, halfH, true, false);
			} else if (phase === 6) {
				// Despawn 3
				set(r1.current, 0, 0, halfW, height, true, true);
				set(r2.current, rightX, 0, halfW, height, true, false);
				set(r3.current, rightX, bottomY, halfW, halfH, false, false);
			} else if (phase === 7) {
				// Despawn 2
				set(r1.current, 0, 0, width, height, true, true);
				set(r2.current, rightX, 0, halfW, height, false, false);
				set(r3.current, rightX, bottomY, halfW, halfH, false, false);
			} else if (phase === 8) {
				// Despawn 1
				set(r1.current, 0, 0, width, height, false, false);
				set(r2.current, rightX, 0, halfW, height, false, false);
				set(r3.current, rightX, bottomY, halfW, halfH, false, false);
			}
		};

		update();
		const ro = new ResizeObserver(update);
		ro.observe(containerRef.current as Element);
		return () => ro.disconnect();
	}, [phase]);

	// Loop Timing
	useEffect(() => {
		const timeouts = TIMINGS.map((t) =>
			setTimeout(() => setPhase(t.phase), t.delay),
		);
		const loop = setTimeout(() => setLoopKey((k) => k + 1), TOTAL_DURATION);
		return () => {
			timeouts.forEach(clearTimeout);
			clearTimeout(loop);
		};
	}, [loopKey]);

	return (
		<div
			ref={containerRef}
			className="relative h-full w-full overflow-hidden p-4"
		>
			<div ref={r1} className="absolute opacity-0">
				1
			</div>
			<div ref={r2} className="absolute opacity-0">
				2
			</div>
			<div ref={r3} className="absolute opacity-0">
				3
			</div>
		</div>
	);
}
