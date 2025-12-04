// --- CONSTANTS (Optimization: Define once) ---
export const TIMINGS = [
	{ phase: 0, delay: 0 },
	{ phase: 1, delay: 500 }, // Spawn 1
	{ phase: 2, delay: 1500 }, // Spawn 2
	{ phase: 3, delay: 2500 }, // Spawn 3
	{ phase: 4, delay: 3500 }, // Swap
	{ phase: 5, delay: 5000 }, // Expand
	{ phase: 6, delay: 6500 }, // Despawn 3
	{ phase: 7, delay: 7500 }, // Despawn 2
	{ phase: 8, delay: 8500 }, // Despawn 1
];
export const TOTAL_DURATION = 9500;

// Shared Styles
export const CARD_BASE =
	"absolute flex items-center justify-center text-4xl font-bold rounded-xl transition-colors will-change-[left,top,width,height,opacity,transform]";
export const CARD_ACTIVE =
	"border-4 border-primary bg-primary/10 text-primary shadow-2xl z-20";
export const CARD_INACTIVE =
	"border-2 border-primary/20 bg-background text-primary/20 z-10";
