import { useEffect, useEffectEvent } from "react";
import { Link } from "@tanstack/react-router";
import { SponsorButton } from "./sponsor-button";
import { GithubIcon, DiscordIcon } from "./icons";
import mangowmLogo from "@mangowm/assets/logos/mangowm.svg";

function ThemeToggle() {
  const onStorage = useEffectEvent(() => {
    const theme = localStorage.getItem("theme");
    const isDark =
      theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  });

  useEffect(() => {
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = () => {
    const html = document.documentElement;
    const isDark = html.classList.contains("dark");
    if (isDark) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <button type="button" onClick={toggle} className="theme-toggle" aria-label="Toggle theme">
      <svg
        className="theme-sun"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      <svg
        className="theme-moon"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}

export function Header() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <img src={mangowmLogo} alt="mangowm" className="w-5 h-5" />
          mangowm
        </Link>
        <ul className="nav-primary">
          <li>
            <a href="/docs" className="nav-link">
              Docs
            </a>
          </li>
          <li>
            <Link
              to="/showcase"
              className="nav-link"
              activeProps={{ className: "nav-link-active" }}
            >
              Showcase
            </Link>
          </li>
          <li>
            <Link
              to="/releases"
              className="nav-link"
              activeProps={{ className: "nav-link-active" }}
            >
              Releases
            </Link>
          </li>
          <li>
            <a href="https://mangowm.github.io/mangowm-settings/" className="nav-link">
              Settings
            </a>
          </li>
          <li className="nav-sponsor">
            <SponsorButton />
          </li>
        </ul>
        <div className="nav-end">
          <ThemeToggle />
          <ul className="nav-icons">
            <li>
              <a
                href="https://discord.gg/CPjbDxesh5"
                className="nav-icon"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
              >
                <DiscordIcon />
              </a>
            </li>
            <li>
              <a
                href="https://github.com/mangowm/mango"
                className="nav-icon"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <GithubIcon />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
