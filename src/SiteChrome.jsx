import React from "react";

export function SiteHeader({
  brandHref = "#top",
  brandAriaLabel = "Ibtsam Ishtiaq home",
  links = [],
  action = null
}) {
  return (
    <header className="site-header" aria-label="Primary navigation">
      <a className="brand" href={brandHref} aria-label={brandAriaLabel}>
        <span className="brand-logo" aria-hidden="true">
          <span className="mark-i mark-i-one" />
          <span className="mark-i mark-i-two" />
          <span className="mark-dash" />
        </span>
        <span className="brand-name">IBTSAM ISHTIAQ</span>
      </a>

      <nav className="nav-links">
        {links.map(({ href, label, external = false }) => (
          <a
            key={`${href}-${label}`}
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
          >
            {label}
          </a>
        ))}
        {action}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer-bottom">
      <span>Ibtsam Ishtiaq — Full-Stack Developer &amp; AI Product Builder</span>
      <a href="/roast" className="underline decoration-2 underline-offset-4 hover:text-white">
        roast a site →
      </a>
    </footer>
  );
}
