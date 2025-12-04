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
// 2. SCROLLER LAYOUT
// ============================================================================
export function ScrollerLayout() {
	const containerRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const leftRef = useRef<HTMLDivElement>(null);
	const centerRef = useRef<HTMLDivElement>(null);
	const rightRef = useRef<HTMLDivElement>(null);

	const [animationPhase, setAnimationPhase] = useState(0);
	const [loopKey, setLoopKey] = useState(0);

	// Setup Transitions
	useEffect(() => {
		// Items
		[leftRef, centerRef, rightRef].forEach((ref) => {
			if (ref.current) {
				ref.current.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
			}
		});
		// Track
		if (trackRef.current) {
			trackRef.current.style.transition =
				"width 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
			// Optimization: Hint browser about changes
			trackRef.current.style.willChange = "width, transform";
		}
	}, []);

	// Main Logic
	useEffect(() => {
		const update = () => {
			const container = containerRef.current;
			const track = trackRef.current;
			if (!container || !track) return;

			const width = container.clientWidth;

			// Responsive Gap Calculation
			const GAP = Math.min(20, width * 0.05);
			const halfScreen = 50;
			const phase = animationPhase;

			// Track Logic (Absolute Positioning Fix)
			const isExpandedTrack = phase >= 3 && phase <= 5;
			const trackMultiplier = isExpandedTrack ? 1.5 : 1.0;

			track.style.width = `${width * trackMultiplier}px`;
			track.style.height = "100%";
			track.style.position = "absolute";
			track.style.top = "0";
			track.style.left = "0";

			// Transform Logic
			let scrollTargetPercent = 0;
			if (phase === 3 || phase === 4 || phase === 5) {
				scrollTargetPercent = 50;
			}
			const scrollX = (width * scrollTargetPercent) / 100;
			track.style.transform = `translateX(-${scrollX}px)`;

			// Window Logic
			const set = (
				el: HTMLDivElement | null,
				xPercent: number,
				widthPercent: number,
				visible = true,
				active = false,
			) => {
				if (!el) return;
				const rawX = (width * xPercent) / 100;
				const rawW = (width * widthPercent) / 100;

				const isVisuallyFirst = xPercent === scrollTargetPercent;
				const isVisuallyLast =
					xPercent + widthPercent === scrollTargetPercent + 100;

				const actualX = isVisuallyFirst ? rawX : rawX + GAP / 2;
				let actualWidth = rawW;
				if (!isVisuallyFirst) actualWidth -= GAP / 2;
				if (!isVisuallyLast) actualWidth -= GAP / 2;

				actualWidth = Math.max(actualWidth, 0);

				el.style.position = "absolute";
				el.style.left = `${actualX}px`;
				el.style.top = "0px";
				el.style.width = `${actualWidth}px`;
				el.style.height = "100%";
				el.style.opacity = visible ? "1" : "0";
				el.style.transform = visible ? "scale(1)" : "scale(0.9)";

				el.className = cn(CARD_BASE, active ? CARD_ACTIVE : CARD_INACTIVE);
			};

			// Phase States
			if (phase === 0) {
				set(leftRef.current, 0, halfScreen, false, false);
				set(centerRef.current, 100, halfScreen, false, false);
				set(rightRef.current, 200, halfScreen, false, false);
			} else if (phase === 1) {
				set(leftRef.current, 25, halfScreen, true, true);
				set(centerRef.current, 100, halfScreen, false, false);
				set(rightRef.current, 200, halfScreen, false, false);
			} else if (phase === 2) {
				set(leftRef.current, 0, halfScreen, true, false);
				set(centerRef.current, 50, halfScreen, true, true);
				set(rightRef.current, 200, halfScreen, false, false);
			} else if (phase === 3) {
				set(leftRef.current, 0, halfScreen, true, false);
				set(centerRef.current, 50, halfScreen, true, false);
				set(rightRef.current, 100, halfScreen, true, true);
			} else if (phase === 4) {
				set(leftRef.current, 0, halfScreen, true, false);
				set(centerRef.current, 100, halfScreen, true, false);
				set(rightRef.current, 50, halfScreen, true, true);
			} else if (phase === 5) {
				set(rightRef.current, 50, 100, true, true);
				set(centerRef.current, 150, halfScreen, true, false);
				set(leftRef.current, -50, halfScreen, true, false);
			} else if (phase === 6) {
				set(rightRef.current, 50, halfScreen, false, false);
				set(centerRef.current, 50, halfScreen, true, true);
				set(leftRef.current, 0, halfScreen, true, false);
			} else if (phase === 7) {
				set(leftRef.current, 25, halfScreen, true, true);
				set(centerRef.current, 50, halfScreen, false, false);
				set(rightRef.current, 50, halfScreen, false, false);
			} else if (phase === 8) {
				set(leftRef.current, 25, halfScreen, false, false);
				set(centerRef.current, 50, halfScreen, false, false);
				set(rightRef.current, 50, halfScreen, false, false);
			}
		};

		update();
		const ro = new ResizeObserver(update);
		ro.observe(containerRef.current as Element);
		return () => ro.disconnect();
	}, [animationPhase]);

	// Loop Timing
	useEffect(() => {
		const timeouts = TIMINGS.map((t) =>
			setTimeout(() => setAnimationPhase(t.phase), t.delay),
		);
		const loop = setTimeout(
			() => setLoopKey((prev) => prev + 1),
			TOTAL_DURATION,
		);
		return () => {
			timeouts.forEach(clearTimeout);
			clearTimeout(loop);
		};
	}, [loopKey]);

	return (
		<div ref={containerRef} className="relative h-full w-full overflow-hidden">
			<div ref={trackRef} className="absolute top-0 left-0 h-full w-full">
				<div ref={leftRef} className="absolute opacity-0">
					1
				</div>
				<div ref={centerRef} className="absolute opacity-0">
					2
				</div>
				<div ref={rightRef} className="absolute opacity-0">
					3
				</div>
			</div>
		</div>
	);
}
