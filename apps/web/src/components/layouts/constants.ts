// --- CONSTANTS (Optimization: Define once) ---
export const TIMINGS = [
	{ phase: 0, delay: 0 },
	{ phase: 1, delay: 500 }, // Spawn window 1
	{ phase: 2, delay: 1500 }, // Spawn window 2
	{ phase: 3, delay: 2500 }, // Spawn window 3
	{ phase: 4, delay: 4000 }, // Layout-specific action
	{ phase: 5, delay: 5000 }, // Layout-specific action
	{ phase: 6, delay: 6000 }, // Despawn window 3
	{ phase: 7, delay: 7000 }, // Despawn window 2
	{ phase: 8, delay: 8000 }, // Despawn window 1
];
export const TOTAL_DURATION = 9500;

// Shared Styles
export const CARD_BASE =
	"absolute flex items-center justify-center text-4xl font-bold rounded-xl transition-colors will-change-[left,top,width,height,opacity,transform]";
export const CARD_ACTIVE =
	"border-4 border-primary bg-primary/10 text-primary shadow-2xl z-20";
export const CARD_INACTIVE =
	"border-2 border-border bg-muted text-muted-foreground z-10";
