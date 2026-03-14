"use client";

import {
	AlertTriangle,
	Check,
	Copy,
	Heart,
	Image as ImageIcon,
	Wallet,
	X,
} from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SPONSOR_DATA = {
	ADDRESS: "0xf9cda472f2556671d2504afc4c35340ec5615da1",
	QR_SRC: "/sponsor-qr.png",
	NETWORK: "BEP20 (BSC)",
	NETWORK_FULL: "BNB Smart Chain (BEP20)",
} as const;

type CopyType = "address" | "qr";

function SimpleDialog({
	open,
	onClose,
	children,
}: {
	open: boolean;
	onClose: () => void;
	children: React.ReactNode;
}) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!open) return;

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [open, onClose]);

	if (!mounted || !open) return null;

	const dialog = (
		<div
			className="fixed inset-0 z-[100] flex items-center justify-center"
			onClick={onClose}
		>
			<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
			<div
				className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg border border-fd-border bg-fd-background p-0 shadow-2xl outline-none"
				onClick={(e) => e.stopPropagation()}
			>
				{children}
			</div>
		</div>
	);

	return createPortal(dialog, document.body);
}

function SimpleToast({ message }: { message: string }) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	const toast = (
		<div className="fixed bottom-4 right-4 z-[110] rounded-lg bg-fd-primary px-4 py-3 text-sm font-medium text-fd-primary-foreground shadow-lg animate-in slide-in-from-bottom-2">
			{message}
		</div>
	);

	return createPortal(toast, document.body);
}

export function SponsorButton() {
	const [open, setOpen] = useState(false);
	const [lastCopied, setLastCopied] = useState<CopyType | null>(null);
	const [toast, setToast] = useState<string | null>(null);

	const showToast = useCallback((message: string) => {
		setToast(message);
		setTimeout(() => setToast(null), 2000);
	}, []);

	const handleCopy = useCallback(async (type: CopyType) => {
		try {
			if (type === "address") {
				await navigator.clipboard.writeText(SPONSOR_DATA.ADDRESS);
				setLastCopied(type);
				showToast("Address copied to clipboard!");
				setTimeout(() => setLastCopied(null), 2000);
			} else {
				const res = await fetch(SPONSOR_DATA.QR_SRC);
				if (!res.ok) throw new Error("Failed to fetch QR code");

				const blob = await res.blob();

				if (navigator.clipboard && ClipboardItem) {
					await navigator.clipboard.write([
						new ClipboardItem({ [blob.type]: blob }),
					]);
					setLastCopied(type);
					showToast("QR Code copied to clipboard!");
					setTimeout(() => setLastCopied(null), 2000);
				} else {
					const url = URL.createObjectURL(blob);
					const link = document.createElement("a");
					link.href = url;
					link.download = "sponsor-qr.png";
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					URL.revokeObjectURL(url);
					showToast("QR Code downloaded!");
				}
			}
		} catch (err) {
			console.error("Copy failed:", err);
			showToast("Failed to copy. Please try manually.");
		}
	}, [showToast]);

	return (
		<>
			<Button
				variant="ghost"
				size="sm"
				aria-label="Sponsor Mango"
				onClick={() => setOpen(true)}
				className="group flex items-center gap-2 bg-red-50 text-red-600 transition-all hover:bg-red-100 hover:text-red-700 active:scale-95 sm:px-4 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900 dark:hover:text-red-300"
			>
				<Heart className="h-4 w-4 fill-current transition-transform group-hover:scale-110" />
				<span className="font-semibold">Sponsor</span>
			</Button>

			<SimpleDialog open={open} onClose={() => setOpen(false)}>
				<div className="relative bg-gradient-to-br from-fd-primary/5 via-fd-background to-fd-background">
					<button
						onClick={() => setOpen(false)}
						className="absolute right-4 top-4 rounded-lg p-1 text-fd-muted-foreground transition-colors hover:bg-fd-muted hover:text-fd-foreground"
						aria-label="Close"
					>
						<X className="h-5 w-5" />
					</button>

					<div className="p-5 pb-0 sm:p-6 sm:pb-2">
						<h2 className="font-bold text-lg tracking-tight sm:text-xl">
							Sponsor Mango
						</h2>
						<p className="mt-1 max-w-md text-xs text-fd-muted-foreground">
							Help sustain open-source development.
						</p>
					</div>

					<div className="grid grid-cols-1 items-center gap-y-4 p-5 sm:grid-cols-2 sm:gap-x-8 sm:p-6">
						<div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
							<button
								onClick={() => handleCopy("qr")}
								aria-label="Copy QR Code"
								className={cn(
									"group relative aspect-square w-full max-w-[140px] overflow-hidden rounded-lg border-2 bg-fd-muted/20 p-2 shadow-sm transition-all active:scale-95 sm:max-w-[200px]",
									lastCopied === "qr"
										? "border-green-500 shadow-green-500/20"
										: "border-fd-border/50 hover:border-fd-primary/50",
								)}
							>
								<img
									src={SPONSOR_DATA.QR_SRC}
									alt="BEP20 QR Code"
									className="h-full w-full rounded-lg object-contain"
								/>

								<div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-fd-background/80 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
									{lastCopied === "qr" ? (
										<Check className="zoom-in h-8 w-8 animate-in text-fd-primary sm:h-10 sm:w-10" />
									) : (
										<>
											<ImageIcon className="mb-1 h-6 w-6 text-fd-foreground sm:mb-2 sm:h-8 sm:w-8" />
											<span className="font-bold text-[9px] text-fd-foreground uppercase tracking-widest sm:text-[10px]">
												Copy QR
											</span>
										</>
									)}
								</div>
							</button>
							<p className="text-center font-bold text-[9px] text-fd-muted-foreground/60 uppercase tracking-widest sm:text-[10px]">
								Tap to copy
							</p>
						</div>

						<div className="flex flex-col justify-center space-y-4 sm:space-y-5">
							<div className="space-y-1.5 sm:space-y-2">
								<div className="flex items-center justify-between px-1">
									<label className="flex items-center gap-1.5 font-bold text-[10px] text-fd-muted-foreground uppercase tracking-wider sm:text-xs">
										<Wallet className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
										Wallet Address
									</label>
									<span className="rounded-lg border border-fd-primary/20 bg-fd-primary/10 px-2 py-0.5 font-bold text-[9px] text-fd-primary sm:px-2.5 sm:py-1 sm:text-[10px]">
										{SPONSOR_DATA.NETWORK}
									</span>
								</div>

								<div
									onClick={() => handleCopy("address")}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											handleCopy("address");
										}
									}}
									role="button"
									tabIndex={0}
									aria-label="Copy wallet address"
									className={cn(
										"group flex cursor-pointer items-center justify-between rounded-lg border-2 bg-fd-card/50 p-2.5 transition-all hover:bg-fd-card active:scale-[0.99] sm:p-3.5",
										lastCopied === "address"
											? "border-green-500/50 bg-green-500/5"
											: "border-fd-border/50 hover:border-fd-primary/50",
									)}
								>
									<code
										className="flex-1 break-all pr-3 font-mono font-semibold text-[10px] text-fd-foreground sm:pr-4 sm:text-xs"
										title={SPONSOR_DATA.ADDRESS}
									>
										{SPONSOR_DATA.ADDRESS}
									</code>
									<div
										className={cn(
											"flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-fd-muted/80 transition-colors group-hover:bg-fd-primary/10 group-hover:text-fd-primary sm:h-8 sm:w-8",
											lastCopied === "address" &&
												"bg-green-500 text-white group-hover:bg-green-600 group-hover:text-white",
										)}
									>
										{lastCopied === "address" ? (
											<Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
										) : (
											<Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
										)}
									</div>
								</div>
							</div>

							<div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 sm:gap-3 sm:p-3.5">
								<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 sm:h-5 sm:w-5" />
								<div className="space-y-0.5 sm:space-y-1">
									<p className="font-bold text-[10px] text-amber-700 uppercase tracking-tight sm:text-xs dark:text-amber-400">
										Verification
									</p>
									<p className="text-[10px] text-fd-muted-foreground leading-relaxed sm:text-[11px]">
										Only use the{" "}
										<span className="font-semibold text-fd-foreground">BEP20</span>{" "}
										network.
									</p>
								</div>
							</div>
						</div>
					</div>

					<div className="border-t border-fd-border/50 bg-fd-muted/30 py-3 text-center sm:py-4">
						<p className="font-bold text-[9px] text-fd-muted-foreground/50 uppercase tracking-[0.2em]">
							Thanks for your support
						</p>
					</div>
				</div>
			</SimpleDialog>

			{toast && <SimpleToast message={toast} />}
		</>
	);
}
