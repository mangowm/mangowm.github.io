import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import mangowmLogo from "@mangowm/assets/logos/mangowm.svg";
import { Button } from "@mangowm/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@mangowm/ui/components/sheet";
import { SponsorButton } from "@/components/sponsor/sponsor-button";
import { DISCORD_URL, GITHUB_URL } from "@/constants";
import { ModeToggle } from "./mode-toggle";
import { DiscordIcon, GithubIcon, MenuSvg } from "./icons";

const NAV_ITEMS = [
  { label: "Docs", href: "/docs/" },
  { label: "Showcase", to: "/showcase" },
  { label: "Brand", to: "/brand" },
  { label: "Settings", href: "/settings/" },
] as const;

type NavItemData = (typeof NAV_ITEMS)[number];

function isCurrent(item: NavItemData, pathname: string) {
  const target = "to" in item ? item.to : item.href;
  const base = target.endsWith("/") ? target : `${target}/`;
  return pathname === target || pathname.startsWith(base);
}

function NavItem({
  item,
  active,
  onNavigate,
  className,
}: {
  item: NavItemData;
  active: boolean;
  onNavigate?: () => void;
  className: string;
}) {
  const shared = {
    className,
    "aria-current": active ? ("page" as const) : undefined,
    onClick: onNavigate,
  };

  if ("to" in item) {
    return (
      <Link to={item.to} {...shared}>
        {item.label}
      </Link>
    );
  }

  return (
    <a href={item.href} {...shared}>
      {item.label}
    </a>
  );
}

function DesktopNav({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Primary"
      className="site-piece pointer-events-auto relative hidden h-[var(--nav-piece-height)] items-center gap-0.5 rounded-full px-[0.4rem] lg:mx-auto lg:flex"
    >
      {NAV_ITEMS.map((item) => (
        <NavItem
          key={item.label}
          item={item}
          active={isCurrent(item, pathname)}
          className="relative z-[1] inline-flex h-8 items-center rounded-full border border-transparent px-[0.8rem] text-sm font-medium whitespace-nowrap text-muted-foreground no-underline transition-colors duration-[180ms] hover:text-foreground focus-visible:border-ring aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
        />
      ))}
    </nav>
  );
}

const SOCIAL_LINKS = [
  { href: DISCORD_URL, label: "Discord", Icon: DiscordIcon },
  { href: GITHUB_URL, label: "GitHub", Icon: GithubIcon },
] as const;

function SocialLinks() {
  return (
    <>
      {SOCIAL_LINKS.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="inline-flex size-8 flex-none items-center justify-center rounded-full border border-transparent text-muted-foreground transition-[color,background-color] duration-150 hover:bg-accent hover:text-foreground focus-visible:border-ring"
        >
          <Icon />
        </a>
      ))}
    </>
  );
}

function MobileNav({
  open,
  setOpen,
  pathname,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  pathname: string;
}) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full lg:hidden"
            aria-label="Open menu"
          />
        }
      >
        <MenuSvg />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="sr-only">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Site navigation and quick links</SheetDescription>
        </SheetHeader>

        <nav aria-label="Primary" className="min-h-0 flex-1 overflow-y-auto p-4">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <NavItem
                  item={item}
                  active={isCurrent(item, pathname)}
                  onNavigate={() => setOpen(false)}
                  className="flex items-center rounded-full border border-transparent px-3 py-2.5 text-[0.9375rem] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:border-ring aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
                />
              </li>
            ))}
          </ul>
        </nav>

        <SheetFooter className="gap-3 border-t border-border">
          <div className="flex items-center justify-between">
            <ModeToggle />
            <div className="flex items-center gap-1">
              <SocialLinks />
            </div>
          </div>
          <SponsorButton className="w-full" />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function Header() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  return (
    <header className="site-header">
      <div className="pointer-events-none relative z-[2] mx-auto flex w-full max-w-[var(--container)] items-center justify-between gap-2">
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="site-piece group inline-flex h-[var(--nav-piece-height)] flex-none items-center gap-2 rounded-full pr-4 pl-[0.85rem] font-display text-[0.95rem] font-semibold tracking-[-0.02em] text-foreground no-underline focus-visible:border-ring"
          aria-label="mangowm home"
        >
          <img
            src={mangowmLogo}
            alt=""
            aria-hidden="true"
            className="size-5 transition-transform duration-[0.35s] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.12] group-hover:rotate-[-8deg]"
          />
          <span>mangowm</span>
        </Link>

        <DesktopNav pathname={pathname} />

        <div className="site-piece flex h-[var(--nav-piece-height)] items-center gap-0.5 rounded-full max-lg:w-[var(--nav-piece-height)] max-lg:justify-center max-lg:px-0 lg:px-2">
          <div className="hidden lg:contents">
            <ModeToggle />
          </div>
          <div className="hidden lg:contents">
            <SocialLinks />
          </div>
          <div className="hidden lg:mx-1 lg:block">
            <SponsorButton />
          </div>
          <MobileNav open={menuOpen} setOpen={setMenuOpen} pathname={pathname} />
        </div>
      </div>
    </header>
  );
}
