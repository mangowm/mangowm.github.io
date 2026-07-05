import { Link } from "@tanstack/react-router";
import { latestVersion } from "../constants";
import { MangoLayouts } from "./mango-layouts";
import { SponsorButton } from "./sponsor-button";
import { ArrowRight, ArrowDown, HeartSvg } from "./icons";

function Badges({ version }: { version: string }) {
  return (
    <div className="mb-6 flex items-center justify-center">
      <Link to="/releases" className="version-badge inline-flex items-center gap-2">
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
      </Link>
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
            <span className="block">Lightweight</span>
            <span className="block">
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
          <div className="hero-col text-left">
            <div className="flex items-center justify-start mb-6">
              <Link to="/releases" className="version-badge inline-flex items-center gap-2">
                <span className="version-dot" />
                {version}
                <ArrowRight />
              </Link>
            </div>
            <h1 className="hero-title hero-title-lg text-left">
              <span className="block">Lightweight</span>
              <span className="block">
                &amp; <span className="hero-title-primary">Feature-Rich</span>
              </span>
            </h1>
            <p className="hero-desc hero-desc-lg ml-0 text-left">
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
              <HeartSvg className="mx-auto w-8 h-8 text-red-500" />
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

export function HomePage() {
  return <Hero version={latestVersion} />;
}
