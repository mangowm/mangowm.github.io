import Image from "next/image";
import Link from "next/link";

export function Footer() {
	return (
		<footer className="border-border border-t bg-background/50 backdrop-blur">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
					<div>
						<div className="mb-4 flex items-center gap-2">
							<Image
								src="/logo-32x32.webp"
								alt="MangoWC Logo"
								width={32}
								height={32}
								className="h-8 w-8 rounded-lg"
							/>
							<span className="font-bold text-foreground">MangoWC</span>
						</div>
						<p className="text-foreground/70 text-sm">
							A minimal, fast, and modern Wayland compositor.
						</p>
					</div>

					<div>
						<h4 className="mb-4 font-semibold text-foreground">Resources</h4>
						<ul className="space-y-2">
							<li>
								<a
									href="https://github.com/DreamMaoMao/mangowc"
									target="_blank"
									rel="noopener noreferrer"
									className="text-foreground/70 text-sm transition-colors hover:text-primary"
								>
									GitHub
								</a>
							</li>
							<li>
								<Link
									href="/docs"
									className="text-foreground/70 text-sm transition-colors hover:text-primary"
								>
									Docs
								</Link>
							</li>
							<li>
								<a
									href="https://github.com/DreamMaoMao/mangowc/wiki"
									target="_blank"
									rel="noopener noreferrer"
									className="text-foreground/70 text-sm transition-colors hover:text-primary"
								>
									Wiki
								</a>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="mb-4 font-semibold text-foreground">Community</h4>
						<ul className="space-y-2">
							<li>
								<a
									href="https://discord.gg/CPjbDxesh5"
									target="_blank"
									rel="noopener noreferrer"
									className="text-foreground/70 text-sm transition-colors hover:text-primary"
								>
									Discord
								</a>
							</li>
							<li>
								<a
									href="https://github.com/DreamMaoMao/mangowc/discussions"
									target="_blank"
									rel="noopener noreferrer"
									className="text-foreground/70 text-sm transition-colors hover:text-primary"
								>
									Discussions
								</a>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="mb-4 font-semibold text-foreground">Connect</h4>
						<div className="flex gap-4">
							<a
								href="https://github.com/DreamMaoMao/mangowc"
								target="_blank"
								rel="noopener noreferrer"
								className="text-foreground/70 transition-colors hover:text-primary"
								aria-label="GitHub"
							>
								<span className="sr-only">GitHub</span>
								<svg
									className="h-5 w-5"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<title>GitHub</title>
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
								</svg>
							</a>
							<a
								href="https://discord.gg/CPjbDxesh5"
								target="_blank"
								rel="noopener noreferrer"
								className="text-foreground/70 transition-colors hover:text-primary"
								aria-label="Discord"
							>
								<span className="sr-only">Discord</span>
								<svg
									className="h-5 w-5"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<title>Discord</title>
									<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.211.375-.444.864-.607 1.25a18.27 18.27 0 0 0-5.487 0c-.163-.386-.395-.875-.607-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.06.06 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.975 14.975 0 0 0 1.293-2.1a.07.07 0 0 0-.038-.098a13.11 13.11 0 0 1-1.872-.892a.072.072 0 0 1-.009-.119c.126-.094.252-.192.372-.291a.07.07 0 0 1 .073-.01c3.928 1.793 8.18 1.793 12.062 0a.07.07 0 0 1 .074.009c.12.099.246.198.373.292a.072.072 0 0 1-.01.119c-.598.35-1.22.645-1.873.891a.075.075 0 0 0-.037.098c.36.698.772 1.355 1.292 2.1a.074.074 0 0 0 .084.028a19.963 19.963 0 0 0 6.002-3.03a.074.074 0 0 0 .032-.057c.44-4.408-.738-8.24-3.124-11.66a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156c0-1.193.93-2.157 2.157-2.157c1.226 0 2.157.964 2.157 2.157c0 1.19-.93 2.155-2.157 2.155zm7.975 0c-1.183 0-2.157-.965-2.157-2.156c0-1.193.93-2.157 2.157-2.157c1.226 0 2.157.964 2.157 2.157c0 1.19-.931 2.155-2.157 2.155z" />
								</svg>
							</a>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
