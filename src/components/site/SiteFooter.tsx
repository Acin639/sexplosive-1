import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/70 bg-surface/60">
      <div className="mx-auto max-w-7xl px-4 py-10 text-center">
        <p className="font-display text-sm font-semibold tracking-tight">
          sex<span className="text-accent">plosive</span>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Sexplosive. All rights reserved.
        </p>
        <nav className="mt-4 flex items-center justify-center gap-5 text-xs">
          <Link to="/about" className="text-muted-foreground hover:text-accent">About</Link>
          <Link to="/terms" className="text-muted-foreground hover:text-accent">Terms &amp; Conditions</Link>
        </nav>
        <p className="mt-3 text-xs text-muted-foreground">
          This site is built using <span className="text-accent">vhx engine</span>.
        </p>
      </div>
    </footer>
  );
}
