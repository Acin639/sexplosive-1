import { Link, useLocation, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { X } from "@phosphor-icons/react";
import { MenuIcon, SearchIcon, ProfileIcon } from "./NavIcons";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchHome, fetchSearch } from "@/lib/api-client";
import { buildLegends } from "@/lib/legends";
import { galleryImages } from "@/lib/gallery-media";
import { categoryCatalog } from "@/lib/category-catalog";
import { SUGGESTION_POOL } from "@/lib/mock-data";
import { SettingsDrawer } from "./SettingsDrawer";
import { AdSlot } from "./AdSlot";
import { usePageStatus } from "@/lib/page-status";
import peachLogo from "@/assets/peach-logo.png";


const PILLS = [
  { label: "Connect", to: "/connect", key: "connect" },
  { label: "Premium", to: "/premium", key: null },
  { label: "Api", to: "/api-docs", key: "api" },
] as const;

const EXTERNAL = ["Live", "Ai tailor", "Ai girlfriend"];

const ICON_PROPS = { weight: "fill" as const, className: "size-5" };

export function TopNav() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const router = useRouter();
  const pathname = useLocation({ select: l => l.pathname });
  const showBack = pathname !== "/" && pathname !== "/index" && !pathname.startsWith("/chebwai");
  const { closed } = usePageStatus();
  const inGallery = useLocation({ select: (l) => l.pathname.startsWith("/gallery") });
  const { data } = useQuery({ queryKey: ["home", 100], queryFn: () => fetchHome(100), enabled: searchOpen });
  const suggestionPool = [...new Set([...(data?.videos.map(video => video.uploader).filter(Boolean) ?? []), ...categoryCatalog().map(category => category.title), ...SUGGESTION_POOL])];

  const backdrop = galleryImages(data?.videos ?? []).slice(0, 12);
  const legendsQ = useQuery({ queryKey: ["legends"], queryFn: () => fetchSearch("legends", { pages: 3, limit: 60 }), enabled: searchOpen });
  const topLegends = buildLegends(legendsQ.data?.videos ?? []).slice(0, 8);
  const suggestions = q.trim()
    ? suggestionPool.filter((s) => s.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 6)
    : suggestionPool.slice(0, 5);

  const go = (term: string) => {
    if (!term.trim()) return;
    setSearchOpen(false);
    setQ("");
    if (inGallery) navigate({ to: "/gallery/search", search: { q: term.trim() } });
    else navigate({ to: "/results", search: { q: term.trim() } });
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label={showBack ? "Go back" : "Open menu"}
            onClick={() => { if (!showBack) { setMenuOpen(true); return; } if (router.history.canGoBack()) router.history.back(); else void navigate({ to: "/" }); }}
            className="size-12 shrink-0 text-foreground hover:text-accent [&_svg]:size-8"
          >
            {showBack ? <ArrowLeft /> : <MenuIcon />}
          </Button>

          {searchOpen ? (
            <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-accent/60 bg-background/70 px-4 backdrop-blur animate-in fade-in slide-in-from-right-4">
              <SearchIcon />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && go(q)}
                placeholder={inGallery ? "Search pictures" : "Search Sexplosive"}
                className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              <button aria-label="Close search" onClick={() => { setSearchOpen(false); setQ(""); }} className="grid size-8 shrink-0 place-items-center hover:text-accent">
                <X weight="bold" className="size-5" />
              </button>
            </div>
          ) : <>
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <img
              src={peachLogo}
              alt=""
              width={1024}
              height={1024}
              className="size-12 shrink-0 drop-shadow-[0_0_12px_rgba(250,94,104,0.45)]"
            />

            <span className="truncate font-display text-lg font-bold tracking-tight glow-text">
              sex<span className="text-accent">plosive</span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <button
              aria-label="Open search"
              onClick={() => setSearchOpen(true)}
              className="grid size-11 shrink-0 place-items-center text-foreground transition-colors hover:text-accent"
            >
              <SearchIcon />
            </button>

            <Link
              to="/profile"
              aria-label="Profile"
              className="grid size-10 shrink-0 place-items-center text-foreground transition-colors hover:text-accent"
            >
              <ProfileIcon />
            </Link>
          </div>
          </>}
        </div>

        <nav className="mx-auto flex max-w-7xl gap-6 overflow-x-auto scrollbar-none px-4 pb-2.5">
          {PILLS.filter((p) => !p.key || !closed[p.key]).map((p) => (
            <Link
              key={p.label}
              to={p.to}
              className="shrink-0 font-display text-sm font-semibold tracking-wide transition-colors hover:text-accent [&.active]:text-accent"
              activeOptions={{ exact: false }}
              activeProps={{ className: "text-accent" }}
            >
              {p.label}
            </Link>
          ))}
          {!closed.advertise && <Link
            to="/advertise"
            activeProps={{ className: "text-accent" }}
            className="shrink-0 font-display text-sm font-semibold tracking-wide transition-colors hover:text-accent"
          >
            Advertise
          </Link>}
          {EXTERNAL.map((label) => (
            <a key={label} href="https://example.com" target="_blank" rel="noopener noreferrer"
              className="shrink-0 font-display text-sm font-semibold tracking-wide transition-colors hover:text-accent">
              {label}
            </a>
          ))}
        </nav>
      </header>


      {searchOpen && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-background pt-28 animate-in fade-in">
          <div aria-hidden className="pointer-events-none fixed inset-0 grid scale-110 grid-cols-3 gap-1 opacity-50 blur-xl sm:grid-cols-4">
            {backdrop.map((v) => (
              <img key={v.id} src={v.thumbnail} alt="" className="h-full min-h-40 w-full object-cover" />
            ))}
          </div>
          <div aria-hidden className="pointer-events-none fixed inset-0 bg-background/65" />
          <div className="relative mx-auto max-w-xl px-4 pb-10">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {q.trim() ? "Suggestions" : "Try searching"}
            </h3>
            {suggestions.length === 0 && <p className="py-2 text-sm text-muted-foreground">No suggestions</p>}
            {suggestions.map((s) => (
              <button key={s} onClick={() => go(s)}
                className="flex w-full items-center gap-3 border-b border-border/60 py-3 text-left text-sm hover:text-accent">
                <SearchIcon />
                <span className="truncate"><Highlight text={s} query={q} /></span>
              </button>
            ))}

            {topLegends.length > 0 && (
              <>
                <h3 className="mt-8 mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Top searched</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {topLegends.map((l, i) => (
                    <Link key={l.slug} to="/legends/$name" params={{ name: l.slug }} onClick={() => { setSearchOpen(false); setQ(""); }}
                      className="flex items-center gap-3 rounded-full bg-background/50 p-1.5 pr-4 backdrop-blur transition-colors hover:bg-secondary">
                      <img src={l.avatar} alt="" className="size-12 shrink-0 rounded-full border-2 border-accent bg-secondary object-cover" />
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{l.name}</span>
                      <span className="text-xs font-bold text-accent">#{i + 1}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}

            <AdSlot slot="suggestions" className="mt-6" />
          </div>
        </div>
      )}

      <SettingsDrawer open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim().toLowerCase();
  const i = q ? text.toLowerCase().indexOf(q) : -1;
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<mark className="bg-transparent font-bold text-accent">{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>;
}
