import { useMemo, useState } from "react";
import {
  Archive,
  ArrowLeft,
  BarChart3,
  FileText,
  Inbox,
  KeyRound,
  MailWarning,
  Megaphone,
  Database,
  PenSquare,
  Reply,
  Search,
  Send,
  Star,
  Trash2,
  Lock,
  Crown,
  Mail as MailIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SEED_MAIL, type Mail, type MailFolder } from "@/lib/mail-data";
import { setPassword, usePasswords } from "@/lib/admin-auth";
import { emailAliases, serviceConfig } from "@/lib/integration-config";
import { DatabaseBrowser } from "./DatabaseBrowser";
import { LegendsPanel, PremiumSuggestionsPanel } from "./DevContentPanels";
import { AD_SLOTS, AD_SLOT_LABELS, FREQUENCY_OPTIONS, REPEATING_SLOTS, addAd, deleteAd, setAdActive, useAds, type AdSlotId } from "@/lib/ads";

const FOLDERS: { id: MailFolder | "starred"; label: string; icon: typeof Inbox }[] = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "starred", label: "Starred", icon: Star },
  { id: "sent", label: "Sent", icon: Send },
  { id: "drafts", label: "Drafts", icon: FileText },
  { id: "spam", label: "Spam", icon: MailWarning },
  { id: "trash", label: "Trash", icon: Trash2 },
];

type DevTab = "mail" | "overview" | "ads" | "premium" | "legends" | "database" | "password";

/** Gmail-style mail workspace. The developer variant adds overview, ads and password tabs. */
export function MailWorkspace({ variant }: { variant: "developer" | "creator" }) {
  const [mails, setMails] = useState<Mail[]>(SEED_MAIL);
  const [folder, setFolder] = useState<MailFolder | "starred">("inbox");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [tab, setTab] = useState<DevTab>("mail");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mails.filter((m) => {
      const inFolder = folder === "starred" ? m.starred : m.folder === folder;
      if (!inFolder) return false;
      if (!q) return true;
      return (
        m.subject.toLowerCase().includes(q) ||
        m.from.toLowerCase().includes(q) ||
        m.body.toLowerCase().includes(q)
      );
    });
  }, [mails, folder, query]);

  const open = mails.find((m) => m.id === openId) ?? null;

  const patch = (id: string, p: Partial<Mail>) =>
    setMails((ms) => ms.map((m) => (m.id === id ? { ...m, ...p } : m)));

  const openMail = (id: string) => {
    setOpenId(id);
    patch(id, { read: true });
  };


  return (
    <div className="min-w-0 max-w-full space-y-4 overflow-hidden">
      <div className="border-b border-border pb-3 text-xs text-muted-foreground">
        <p>Truehost mail not connected · Sender {serviceConfig.smtp.from}</p>
        <details className="mt-2"><summary className="cursor-pointer">Email aliases</summary><dl className="mt-2 grid gap-2 sm:grid-cols-2">{Object.entries(emailAliases).map(([name, address]) => <div key={name} className="min-w-0"><dt className="capitalize">{name}</dt><dd className="break-all text-foreground">{address}</dd></div>)}</dl></details>
      </div>
      {variant === "developer" && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {(
            [
              ["mail", "Mail", Inbox],
              ["overview", "Overview", BarChart3],
              ["ads", "Ads", Megaphone],
              ["premium", "Premium", Lock],
              ["legends", "Legends", Crown],
              ["database", "Database", Database],
              ["password", "Password", KeyRound],
            ] as const
          ).map(([id, label, Icon]) => (
            <Button
              key={id}
              variant={tab === id ? "default" : "secondary"}
              className="rounded-full"
              onClick={() => setTab(id)}
            >
              <Icon className="mr-2 size-4" /> {label}
            </Button>
          ))}
        </div>
      )}

      {(variant === "creator" || tab === "mail") && (
        <div className="grid min-w-0 gap-4 lg:h-[calc(100vh-14rem)] lg:min-h-[560px] lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-0 lg:border lg:border-border">
          {/* Folder sidebar */}
          <aside className="min-w-0 rounded-3xl surface-card p-3 lg:overflow-y-auto lg:rounded-none lg:border-r lg:border-border lg:bg-transparent lg:shadow-none">
            <Button className="mb-3 w-full rounded-full" onClick={() => setComposing(true)}>
              <PenSquare className="mr-2 size-4" /> Compose
            </Button>
            <nav className="flex gap-1 overflow-x-auto scrollbar-none lg:block lg:space-y-1">
              {FOLDERS.map(({ id, label, icon: Icon }) => {
                const count =
                  id === "starred"
                    ? mails.filter((m) => m.starred).length
                    : mails.filter((m) => m.folder === id).length;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setFolder(id);
                      setOpenId(null);
                    }}
                    className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-sm lg:w-full ${
                      folder === id ? "bg-secondary font-semibold text-accent" : "text-muted-foreground hover:bg-secondary/60"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span className="flex-1 text-left">{label}</span>
                    <span className="text-xs">{count}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main pane */}
          <section className="flex min-w-0 flex-col rounded-3xl surface-card p-4 lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none">
            <div className="relative mb-3 lg:mb-0 lg:border-b lg:border-border lg:p-3">
              <Search className="absolute left-3 top-1/2 size-4 lg:left-6 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search mail"
                className="pl-9"
                maxLength={120}
              />
            </div>

            <div className="min-h-0 flex-1 lg:grid lg:grid-cols-[minmax(320px,2fr)_minmax(0,3fr)]">
            {open && (
              <div className="lg:order-2 lg:overflow-y-auto lg:p-6">
                <button
                  onClick={() => setOpenId(null)}
                  className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground lg:hidden"
                >
                  <ArrowLeft className="size-4" /> Back to list
                </button>
                <h2 className="break-words font-display text-lg font-bold">{open.subject}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  From {open.from} · To {open.to} · {open.time}
                </p>
                <p className="mt-4 whitespace-pre-line break-words rounded-2xl bg-secondary/60 p-4 text-sm leading-relaxed">
                  {open.body}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => setComposing(true)}
                  >
                    <Reply className="mr-2 size-4" /> Reply
                  </Button>
                  <Button
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => {
                      patch(open.id, { folder: "trash" });
                      setOpenId(null);
                      toast.success("Moved to trash");
                    }}
                  >
                    <Trash2 className="mr-2 size-4" /> Delete
                  </Button>
                  <Button
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => {
                      patch(open.id, { folder: "inbox", read: true });
                      setOpenId(null);
                      toast.success("Archived to inbox");
                    }}
                  >
                    <Archive className="mr-2 size-4" /> Archive
                  </Button>
                </div>
              </div>
            )}
            {!open && (
              <div className="hidden lg:order-2 lg:grid lg:place-items-center lg:text-sm lg:text-muted-foreground">
                <p className="flex items-center gap-2"><MailIcon className="size-5" /> Select a message to read it</p>
              </div>
            )}
              <div className={`divide-y divide-border/60 lg:order-1 lg:overflow-y-auto lg:border-r lg:border-border ${open ? "hidden lg:block" : ""}`}>
                {visible.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">No mail here.</p>
                )}
                {visible.map((m) => (
                  <div key={m.id} className={`flex items-center gap-2 py-3 lg:px-3 ${openId === m.id ? "lg:bg-secondary/70" : ""}`}>
                    <button
                      onClick={() => patch(m.id, { starred: !m.starred })}
                      aria-label={m.starred ? "Unstar" : "Star"}
                      className="shrink-0"
                    >
                      <Star
                        className={`size-4 ${m.starred ? "fill-gold text-gold" : "text-muted-foreground"}`}
                      />
                    </button>
                    <button onClick={() => openMail(m.id)} className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <p className={`min-w-0 flex-1 truncate text-sm ${m.read ? "" : "font-bold"}`}>
                          {m.subject}
                        </p>
                        <span className="shrink-0 text-xs text-muted-foreground">{m.time}</span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {m.from} — {m.body}
                      </p>
                    </button>
                    <button
                      onClick={() => patch(m.id, { folder: "trash" })}
                      aria-label="Move to trash"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {variant === "developer" && tab === "overview" && <MailOverview mails={mails} />}
      {variant === "developer" && tab === "ads" && <AdsManager />}
      {variant === "developer" && tab === "premium" && <PremiumSuggestionsPanel />}
      {variant === "developer" && tab === "legends" && <LegendsPanel />}
      {variant === "developer" && tab === "database" && <DatabaseBrowser />}
      {variant === "developer" && tab === "password" && <PasswordPanel />}

      {composing && (
        <ComposeDialog
          onClose={() => setComposing(false)}
          onSend={(to, subject, body) => {
            void to; void subject; void body;
            toast.error("Email was not sent. Connect Truehost with a real SMTP host and password first.");
          }}
          onDraft={(to, subject, body) => {
            setMails((ms) => [
              {
                id: `m${Date.now()}`,
                from: serviceConfig.smtp.from,
                to,
                subject,
                body,
                time: "Now",
                folder: "drafts",
                read: true,
                starred: false,
              },
              ...ms,
            ]);
            setComposing(false);
            toast.success("Draft saved");
          }}
        />
      )}
    </div>
  );
}

function ComposeDialog({
  onClose,
  onSend,
  onDraft,
}: {
  onClose: () => void;
  onSend: (to: string, subject: string, body: string) => void;
  onDraft: (to: string, subject: string, body: string) => void;
}) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm">
      <form
        className="w-full max-w-lg space-y-3 rounded-3xl surface-card sheen p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!to.trim() || !subject.trim() || !body.trim()) {
            toast.error("Fill in recipient, subject and message");
            return;
          }
          onSend(to.trim(), subject.trim(), body.trim());
        }}
      >
        <h2 className="font-display text-lg font-bold">New message</h2>
        <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="To" type="email" maxLength={255} />
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" maxLength={140} />
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your message…" rows={8} maxLength={4000} />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" className="rounded-full">
            <Send className="mr-2 size-4" /> Send
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="rounded-full"
            onClick={() => onDraft(to.trim(), subject.trim(), body.trim())}
          >
            Save draft
          </Button>
          <Button type="button" variant="ghost" className="rounded-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

function MailOverview({ mails }: { mails: Mail[] }) {
  const unread = mails.filter((m) => m.folder === "inbox" && !m.read).length;
  const senders = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of mails) counts.set(m.from, (counts.get(m.from) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [mails]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-3xl surface-card p-5">
        <h2 className="font-display text-lg font-bold">All mail overview</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <OverviewStat label="Total mails" value={mails.length} />
          <OverviewStat label="Unread in inbox" value={unread} />
          {FOLDERS.map((f) => (
            <OverviewStat
              key={f.id}
              label={f.label}
              value={
                f.id === "starred"
                  ? mails.filter((m) => m.starred).length
                  : mails.filter((m) => m.folder === f.id).length
              }
            />
          ))}
        </div>
      </section>
      <section className="rounded-3xl surface-card p-5">
        <h2 className="font-display text-lg font-bold">Top senders</h2>
        <div className="mt-4 divide-y divide-border/60">
          {senders.map(([from, count]) => (
            <div key={from} className="flex items-center justify-between py-2 text-sm">
              <span className="min-w-0 flex-1 truncate">{from}</span>
              <span className="rounded-full bg-secondary px-3 py-0.5 text-xs font-semibold text-accent">
                {count}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function OverviewStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-secondary p-3">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-display text-xl font-bold">{value}</p>
    </div>
  );
}

function AdsManager() {
  const { ads, error } = useAds();
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [videoUrl, setVideoUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [slot, setSlot] = useState<AdSlotId>("home-top");
  const [frequency, setFrequency] = useState(3);
  const [countdown, setCountdown] = useState(5);
  const repeating = REPEATING_SLOTS.includes(slot);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-3xl surface-card p-5">
        <h2 className="font-display text-lg font-bold">Add an ad</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Pick a section of the website and the ad appears there instantly.
        </p>
        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const isVideo = mediaType === "video";
            if (!title.trim() || !linkUrl.trim() || (isVideo ? !videoUrl.trim() : !imageUrl.trim())) {
              toast.error(isVideo ? "Fill in title, video and link" : "Fill in title, image and link");
              return;
            }
            try {
              await addAd({ title: title.trim(), imageUrl: imageUrl.trim(), mediaType, ...(isVideo ? { videoUrl: videoUrl.trim() } : {}), linkUrl: linkUrl.trim(), slot, active: true, frequency: repeating ? frequency : 1, countdown });
              toast.success("Ad published");
              setTitle("");
              setImageUrl("");
              setVideoUrl("");
              setLinkUrl("");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Could not save ad");
            }
          }}
        >
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ad title" maxLength={80} />
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Ad type">
            {(["image", "video"] as const).map((t) => (
              <Button key={t} type="button" role="radio" aria-checked={mediaType === t} variant={mediaType === t ? "default" : "secondary"} className="rounded-full capitalize" onClick={() => setMediaType(t)}>
                {t} ad
              </Button>
            ))}
          </div>
          {mediaType === "video" && (
            <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Video URL (.mp4 / .webm)" type="url" maxLength={500} />
          )}
          <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder={mediaType === "video" ? "Poster image URL (optional)" : "Image URL"} type="url" maxLength={500} />
          <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="Link URL" type="url" maxLength={500} />
          <select
            value={slot}
            onChange={(e) => setSlot(e.target.value as AdSlotId)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            aria-label="Ad placement"
          >
            {AD_SLOTS.map((s) => (
              <option key={s} value={s}>
                {AD_SLOT_LABELS[s]}
              </option>
            ))}
          </select>
          {repeating && (
            <label className="block text-xs text-muted-foreground">
              Frequency
              <select
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              >
                {FREQUENCY_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f === 1 ? (slot === "slider" ? "After every slide" : "After every video") : `After every ${f} ${slot === "slider" ? "slides" : "videos"}`}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block text-xs text-muted-foreground">
            Countdown before viewer can close/skip (seconds)
            <Input type="number" min={0} max={30} value={countdown} onChange={(e) => setCountdown(Math.min(30, Math.max(0, Number(e.target.value) || 0)))} className="mt-1" />
          </label>
          <Button type="submit" className="w-full rounded-full">
            <Megaphone className="mr-2 size-4" /> Publish ad
          </Button>
        </form>
      </section>

      <section className="rounded-3xl surface-card p-5">
        <h2 className="font-display text-lg font-bold">Live ads</h2>
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        <div className="mt-4 space-y-3">
          {ads.length === 0 && (
            <p className="py-3 text-sm text-muted-foreground">No ads yet — add one on the left.</p>
          )}
          {ads.map((ad) => (
            <div key={ad.id} className="flex items-center gap-3 rounded-2xl bg-secondary p-3">
              {ad.mediaType === "video" && ad.videoUrl ? <video src={ad.videoUrl} muted playsInline className="size-12 shrink-0 rounded-xl object-cover" /> : <img src={ad.imageUrl} alt="" className="size-12 shrink-0 rounded-xl object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{ad.title}</p>
                <p className="truncate text-xs text-muted-foreground">{ad.mediaType === "video" ? "Video · " : ""}{AD_SLOT_LABELS[ad.slot] ?? ad.slot}
                  {REPEATING_SLOTS.includes(ad.slot) && ` · every ${ad.frequency ?? 3}`} · {ad.countdown ?? 5}s
                </p>
                <p className="text-xs text-muted-foreground">
                  {ad.impressions ?? 0} views · {ad.clicks ?? 0} clicks · {ad.impressions ? (((ad.clicks ?? 0) / ad.impressions) * 100).toFixed(1) : "0.0"}% CTR
                </p>
              </div>
              <Switch
                checked={ad.active}
                onCheckedChange={(v) => setAdActive(ad.id, v).catch(() => toast.error("Could not update ad"))}
                aria-label={`Toggle ${ad.title}`}
              />
              <button
                onClick={() => deleteAd(ad.id).then(() => toast.success("Ad deleted")).catch(() => toast.error("Could not delete ad"))}
                aria-label={`Delete ${ad.title}`}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PasswordPanel() {
  const passwords = usePasswords();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <section className="mx-auto max-w-md rounded-3xl surface-card p-5">
      <h2 className="font-display text-lg font-bold">Change admin password</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        This is the password that unlocks the whole console.
      </p>
      <form
        className="mt-4 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (current !== passwords.admin) {
            toast.error("Current password is wrong");
            return;
          }
          if (next.length < 6) {
            toast.error("New password needs at least 6 characters");
            return;
          }
          if (next !== confirm) {
            toast.error("New passwords do not match");
            return;
          }
          try {
            await setPassword("admin", next);
            toast.success("Admin password changed");
            setCurrent("");
            setNext("");
            setConfirm("");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not save password");
          }
        }}
      >
        <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Current password" maxLength={64} />
        <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="New password" maxLength={64} />
        <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat new password" maxLength={64} />
        <Button type="submit" className="w-full rounded-full">
          <KeyRound className="mr-2 size-4" /> Save new password
        </Button>
      </form>
    </section>
  );
}
