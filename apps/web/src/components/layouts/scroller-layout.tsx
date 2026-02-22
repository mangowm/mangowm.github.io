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

interface ScrollerLayoutProps {
	orientation: "horizontal" | "vertical";
}

export function ScrollerLayout({ orientation }: ScrollerLayoutProps) {
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
			// Changed from specific properties to 'all' to handle orientation switches gracefully
			trackRef.current.style.transition =
				"all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
			trackRef.current.style.willChange = "width, height, transform";
		}
	}, []);

	// Main Logic
	useEffect(() => {
		const update = () => {
			const container = containerRef.current;
			const track = trackRef.current;
			if (!container || !track) return;

			const width = container.clientWidth;
			const height = container.clientHeight;

			const isVert = orientation === "vertical";
			// Dimension used for spacing (Width for Horizontal, Height for Vertical)
			const dim = isVert ? height : width;

			// Responsive Gap Calculation
			const GAP = Math.min(20, dim * 0.05);
			const halfScreen = 50; // Percentage
			const phase = animationPhase;

			// Track Logic (Absolute Positioning Fix)
			// Only phase 3 needs expanded track (windows at 0%, 50%, 100%)
			const isExpandedTrack = phase === 3;
			const trackMultiplier = isExpandedTrack ? 1.5 : 1.0;

			// Reset styles to avoid conflicts when switching orientation
			track.style.width = "";
			track.style.height = "";
			track.style.transform = "";

			if (isVert) {
				track.style.width = "100%";
				track.style.height = `${height * trackMultiplier}px`;
			} else {
				track.style.width = `${width * trackMultiplier}px`;
				track.style.height = "100%";
			}
			track.style.position = "absolute";
			track.style.top = "0";
			track.style.left = "0";

			// Transform Logic - only scroll for phase 3
			const scrollTargetPercent = phase === 3 ? 50 : 0;
			const scrollOffset = (dim * scrollTargetPercent) / 100;

			if (isVert) {
				track.style.transform = `translateY(-${scrollOffset}px)`;
			} else {
				track.style.transform = `translateX(-${scrollOffset}px)`;
			}

			// Window Logic
			const set = (
				el: HTMLDivElement | null,
				options: {
					primaryOffset: number; // main axis position (percent)
					primarySize: number; // main axis size (percent)
					secondaryOffset?: number; // cross axis position (percent) - for stacking
					secondarySize?: number; // cross axis size (percent) - for stacking
					visible?: boolean;
					active?: boolean;
				},
			) => {
				const {
					primaryOffset,
					primarySize,
					secondaryOffset = 0,
					secondarySize = 100,
					visible = true,
					active = false,
				} = options;

				if (!el) return;

				const isVisuallyFirst = primaryOffset === scrollTargetPercent;
				const isVisuallyLast =
					primaryOffset + primarySize === scrollTargetPercent + 100;

				// Primary axis calculations
				const rawPos = (dim * primaryOffset) / 100;
				const rawSize = (dim * primarySize) / 100;
				const actualPos = isVisuallyFirst ? rawPos : rawPos + GAP / 2;
				let actualSize = rawSize;
				if (!isVisuallyFirst) actualSize -= GAP / 2;
				if (!isVisuallyLast) actualSize -= GAP / 2;
				actualSize = Math.max(actualSize, 0);

				// Secondary axis calculations (matching tile-layout approach)
				const secondaryDim = isVert ? width : height;
				let actualSecondaryPos: number;
				let actualSecondarySize: number;

				if (secondarySize < 100) {
					// Stacking mode - use tile-layout style calculations
					const halfSecondary = (secondaryDim - GAP) / 2;
					if (secondaryOffset === 0) {
						actualSecondaryPos = 0;
						actualSecondarySize = halfSecondary;
					} else {
						actualSecondaryPos = halfSecondary + GAP;
						actualSecondarySize = halfSecondary;
					}
				} else {
					actualSecondaryPos = 0;
					actualSecondarySize = secondaryDim;
				}

				el.style.position = "absolute";
				el.style.opacity = visible ? "1" : "0";
				el.style.transform = visible ? "scale(1)" : "scale(0.9)";
				el.className = cn(CARD_BASE, active ? CARD_ACTIVE : CARD_INACTIVE);

				if (isVert) {
					el.style.left = `${actualSecondaryPos}px`;
					el.style.width = `${actualSecondarySize}px`;
					el.style.top = `${actualPos}px`;
					el.style.height = `${actualSize}px`;
				} else {
					el.style.top = `${actualSecondaryPos}px`;
					el.style.height = `${actualSecondarySize}px`;
					el.style.left = `${actualPos}px`;
					el.style.width = `${actualSize}px`;
				}
			};

			// Phase States
			// 0: Init (all hidden)
			// 1: Spawn window 1
			// 2: Spawn window 2 (50/50 split)
			// 3: Spawn window 3 (all 3 visible in row)
			// 4: Stack - windows 2&3 stack on right (2 above, 3 below), window 3 focused
			// 5: Unstack - window 3 expands to full-height right, window 2 fades out from stacked
			// 6: Window 3 fades out, window 2 fades in at full-height right
			// 7: Despawn window 2
			// 8: Despawn window 1

			if (phase === 0) {
				set(leftRef.current, {
					primaryOffset: 0,
					primarySize: halfScreen,
					visible: false,
				});
				set(centerRef.current, {
					primaryOffset: 100,
					primarySize: halfScreen,
					visible: false,
				});
				set(rightRef.current, {
					primaryOffset: 200,
					primarySize: halfScreen,
					visible: false,
				});
			} else if (phase === 1) {
				set(leftRef.current, {
					primaryOffset: 25,
					primarySize: halfScreen,
					visible: true,
					active: true,
				});
				set(centerRef.current, {
					primaryOffset: 100,
					primarySize: halfScreen,
					visible: false,
				});
				set(rightRef.current, {
					primaryOffset: 200,
					primarySize: halfScreen,
					visible: false,
				});
			} else if (phase === 2) {
				set(leftRef.current, {
					primaryOffset: 0,
					primarySize: halfScreen,
					visible: true,
				});
				set(centerRef.current, {
					primaryOffset: 50,
					primarySize: halfScreen,
					visible: true,
					active: true,
				});
				set(rightRef.current, {
					primaryOffset: 200,
					primarySize: halfScreen,
					visible: false,
				});
			} else if (phase === 3) {
				set(leftRef.current, {
					primaryOffset: 0,
					primarySize: halfScreen,
					visible: true,
				});
				set(centerRef.current, {
					primaryOffset: 50,
					primarySize: halfScreen,
					visible: true,
				});
				set(rightRef.current, {
					primaryOffset: 100,
					primarySize: halfScreen,
					visible: true,
					active: true,
				});
			} else if (phase === 4) {
				// Stack phase: Window 1 left, Windows 2&3 stacked on right
				// Window 3 is focused while coming to stack position
				set(leftRef.current, {
					primaryOffset: 0,
					primarySize: halfScreen,
					visible: true,
				});
				set(centerRef.current, {
					primaryOffset: 50,
					primarySize: halfScreen,
					secondaryOffset: 0,
					secondarySize: 50,
					visible: true,
				});
				set(rightRef.current, {
					primaryOffset: 50,
					primarySize: halfScreen,
					secondaryOffset: 50,
					secondarySize: 50,
					visible: true,
					active: true,
				});
			} else if (phase === 5) {
				// Window 3 unstacks: expands from bottom-right stacked to full-height right side
				// Window 2 positioned off-screen to the right, ready to slide in
				set(leftRef.current, {
					primaryOffset: 0,
					primarySize: halfScreen,
					visible: true,
				});
				// Window 3: expands from bottom stacked to full-height
				set(rightRef.current, {
					primaryOffset: 50,
					primarySize: halfScreen,
					visible: true,
					active: true,
				});
				// Window 2: positioned off-screen right, ready to slide in
				set(centerRef.current, {
					primaryOffset: 100,
					primarySize: halfScreen,
					visible: false,
				});
			} else if (phase === 6) {
				// Window 3 fades out from right side, window 2 fades in at full-height right side
				set(rightRef.current, {
					primaryOffset: 50,
					primarySize: halfScreen,
					visible: false,
				});
				set(leftRef.current, {
					primaryOffset: 0,
					primarySize: halfScreen,
					visible: true,
				});
				set(centerRef.current, {
					primaryOffset: 50,
					primarySize: halfScreen,
					visible: true,
					active: true,
				});
			} else if (phase === 7) {
				set(leftRef.current, {
					primaryOffset: 25,
					primarySize: halfScreen,
					visible: true,
					active: true,
				});
				set(centerRef.current, {
					primaryOffset: 50,
					primarySize: halfScreen,
					visible: false,
				});
				set(rightRef.current, {
					primaryOffset: 50,
					primarySize: halfScreen,
					visible: false,
				});
			} else if (phase === 8) {
				set(leftRef.current, {
					primaryOffset: 25,
					primarySize: halfScreen,
					visible: false,
				});
				set(centerRef.current, {
					primaryOffset: 50,
					primarySize: halfScreen,
					visible: false,
				});
				set(rightRef.current, {
					primaryOffset: 50,
					primarySize: halfScreen,
					visible: false,
				});
			}
		};

		update();
		const ro = new ResizeObserver(update);
		ro.observe(containerRef.current as Element);
		return () => ro.disconnect();
	}, [animationPhase, orientation]);

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
