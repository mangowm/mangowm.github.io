import { useEffect } from "react";
import { latestVersion } from "./constants";
import { MangoLayouts } from "./components/mango-layouts";
import { SponsorButton } from "./components/sponsor-button";
import { GithubIcon, DiscordIcon, ArrowRight, ArrowDown, HeartSvg } from "./components/icons";

function ThemeToggle() {
  useEffect(() => {
    const onStorage = () => {
      const theme = localStorage.getItem("theme");
      const isDark =
        theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", isDark);
    };
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

function Header() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <a href="/" className="nav-logo">
          <img src="/logo.svg" alt="mangowm" style={{ width: "1.25rem", height: "1.25rem" }} />
          mangowm
        </a>
        <ul className="nav-primary">
          <li>
            <a href="/docs" className="nav-link">
              Docs
            </a>
          </li>
          <li>
            <a href="/showcase" className="nav-link">
              Showcase
            </a>
          </li>
          <li>
            <a href="/releases" className="nav-link">
              Releases
            </a>
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

function Badges({ version }: { version: string }) {
  return (
    <div
      className="badges"
      style={{
        marginBottom: "1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <a
        href="/releases"
        className="version-badge"
        style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
      >
        <span className="version-dot" />
        {version}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  );
}

function Hero({ version }: { version: string }) {
  return (
    <>
      {/* Mobile */}
      <section className="hero-mobile">
        <div aria-hidden="true" className="grid-bg hero-grid-bg" />
        <div className="hero-content">
          <Badges version={version} />
          <h1 className="hero-title">
            <span style={{ display: "block" }}>Lightweight</span>
            <span style={{ display: "block" }}>
              &amp; <span className="hero-title-primary">Feature-Rich</span>
            </span>
          </h1>
          <p className="hero-desc">
            mangowm is a lightweight, feature rich modern wayland compositor.
          </p>
          <div className="hero-actions">
            <a href="/docs" className="btn-primary">
              Get Started
            </a>
            <a
              href="https://github.com/mangowm/mango"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              View on GitHub
            </a>
          </div>
        </div>
        <div aria-hidden="true" className="scroll-indicator">
          <div className="scroll-line" />
          <ArrowDown />
        </div>
      </section>

      {/* Mobile layouts */}
      <div className="layouts-mobile">
        <MangoLayouts />
      </div>

      {/* Desktop */}
      <section className="hero-desktop">
        <div aria-hidden="true" className="grid-bg hero-grid-bg" />
        <div className="hero-row">
          <div className="hero-col" style={{ textAlign: "left" }}>
            <div className="badges badges-left">
              <a
                href="/releases"
                className="version-badge"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                <span className="version-dot" />
                {version}
                <ArrowRight />
              </a>
            </div>
            <h1 className="hero-title hero-title-lg" style={{ textAlign: "left" }}>
              <span style={{ display: "block" }}>Lightweight</span>
              <span style={{ display: "block" }}>
                &amp; <span className="hero-title-primary">Feature-Rich</span>
              </span>
            </h1>
            <p className="hero-desc hero-desc-lg" style={{ marginLeft: 0, textAlign: "left" }}>
              mangowm is a modern wayland compositor based on wlroots &amp; scenefx.
            </p>
            <div className="hero-actions hero-actions-left">
              <a href="/docs" className="btn-primary">
                Get Started
              </a>
              <a
                href="https://github.com/mangowm/mango"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                View on GitHub
              </a>
            </div>
          </div>
          <div className="hero-col-layouts">
            <MangoLayouts />
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <section className="sponsors-section">
        <div aria-hidden="true" className="grid-bg hero-grid-bg hero-grid-bg-center" />
        <div className="sponsors-container">
          <h2 className="sponsors-title">Our Sponsors</h2>
          <p className="sponsors-subtitle">
            Thank you to these amazing people for supporting mango.
          </p>

          <div className="sponsors-grid">
            {["dl09r", "tonybanters", "vinthara"].map((name) => (
              <a
                key={name}
                href={`https://github.com/${name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="sponsor-card"
              >
                <div className="sponsor-avatar-wrap">
                  <div className="sponsor-glow" />
                  <img
                    src={`https://unavatar.io/github/${name}`}
                    alt={name}
                    className="sponsor-avatar"
                  />
                </div>
                <span className="sponsor-name">{name}</span>
              </a>
            ))}
          </div>

          <div className="sponsor-cta">
            <div className="sponsor-cta-card">
              <HeartSvg className="sponsor-cta-icon" />
              <h3 className="sponsor-cta-title">Become a Sponsor</h3>
              <p className="sponsor-cta-desc">
                If mango makes your desktop better, consider supporting its development. Every
                contribution helps.
              </p>
              <div className="sponsor-cta-btn">
                <SponsorButton size="lg" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <Hero version={latestVersion} />
    </>
  );
}
