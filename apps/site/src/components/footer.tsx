import { useEffect, useRef, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import mangowmLogo from "@mangowm/assets/logos/mangowm.svg";
import { DISCORD_URL, GITHUB_URL } from "@/constants";

const SIGNATURE_LOGO_STYLE = {
  "--signature-logo": `url("${mangowmLogo}")`,
} as CSSProperties;

type FooterLink = { label: string; title?: string } & (
  | { href: string; to?: undefined }
  | { to: "/showcase" | "/brand" | "/sponsor"; href?: undefined }
);

const FOOTER_LINK_GROUPS: readonly { label: string; links: readonly FooterLink[] }[] = [
  {
    label: "Site",
    links: [
      { label: "Docs", href: "/docs/" },
      { label: "Showcase", to: "/showcase" },
      { label: "Brand", to: "/brand" },
      { label: "Sponsor", to: "/sponsor" },
      { label: "Settings", href: "/settings/" },
    ],
  },
  {
    label: "Project",
    links: [
      { label: "GitHub", href: GITHUB_URL },
      { label: "Releases", href: `${GITHUB_URL}/releases` },
      {
        label: "mangobar",
        href: "https://github.com/mangowm/mangobar",
        title: "A simple status bar for mango",
      },
      {
        label: "Repology",
        href: "https://repology.org/project/mangowm/versions",
        title: "Package status on Repology",
      },
      { label: "License", href: `${GITHUB_URL}/blob/main/LICENSE` },
    ],
  },
  {
    label: "Community",
    links: [
      { label: "Discord", href: DISCORD_URL },
      { label: "Discussions", href: `${GITHUB_URL}/discussions` },
      { label: "Issues", href: `${GITHUB_URL}/issues` },
    ],
  },
];

const LINK_CLASS =
  "relative inline-block w-fit text-[0.8125rem] text-muted-foreground transition-colors duration-150 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-primary/80 after:transition-transform after:duration-200 after:ease-out hover:text-foreground hover:after:scale-x-100 focus-visible:text-foreground focus-visible:after:scale-x-100";

function FooterNavLink({ link }: { link: FooterLink }) {
  if (link.to) {
    return (
      <Link to={link.to} title={link.title} className={LINK_CLASS}>
        {link.label}
      </Link>
    );
  }

  return (
    <a
      href={link.href}
      title={link.title}
      className={LINK_CLASS}
      {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {link.label}
    </a>
  );
}

export function Footer() {
  const signatureRef = useRef<HTMLDivElement>(null);

  // The wave is a paint-bound effect, so pause it while the wordmark is off-screen.
  useEffect(() => {
    const element = signatureRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) element.dataset.wave = entry.isIntersecting ? "on" : "off";
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="site-footer">
      <div className="mx-auto w-full max-w-[var(--container)] px-5 sm:px-8">
        <div className="grid gap-10 py-10 sm:py-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center lg:gap-16 lg:py-14">
          <div ref={signatureRef} className="site-footer-wordmark mx-auto lg:mx-0">
            <Link
              to="/"
              aria-label="mangowm home"
              className="site-footer-signature-word footer-brand"
            >
              <span>mang</span>
              <span className="site-footer-signature-o" style={SIGNATURE_LOGO_STYLE} />
              <span>wm</span>
            </Link>
          </div>

          <div className="mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
            <nav aria-label="Footer" className="grid gap-4">
              {FOOTER_LINK_GROUPS.map((group) => (
                <div
                  key={group.label}
                  className="grid grid-cols-[5.25rem_1fr] items-baseline gap-3"
                >
                  <h2 className="font-mono text-[0.6875rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                    {group.label}
                  </h2>
                  <ul className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <FooterNavLink link={link} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
