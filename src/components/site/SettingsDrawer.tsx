import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, EyeOff, LogOut, Radio, Megaphone, Puzzle, LogIn, UserPlus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { setStealth as persistStealth, useStealth } from "@/lib/stealth";
import { logOut, useAccount } from "@/lib/account";

export function SettingsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [notif, setNotif] = useState(true);
  const stealth = useStealth();
  const { signedIn } = useAccount();
  const navigate = useNavigate();
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  useEffect(() => {
    document.body.classList.toggle("drawer-pushed", open && desktop);
    return () => document.body.classList.remove("drawer-pushed");
  }, [open, desktop]);

  const body = (

        <div className="py-2">
          <Row icon={<Bell className="size-5 text-accent" />} label="Notification">
            <div className="flex items-center gap-2">
              {!signedIn && <span className="text-[11px] text-muted-foreground">Log in first</span>}
              <Switch
                checked={signedIn && notif}
                disabled={!signedIn}
                onCheckedChange={setNotif}
                aria-label="Notifications"
              />
            </div>
          </Row>
          <Row icon={<EyeOff className="size-5 text-accent" />} label="Stealth (incognito)">
            <Switch
              checked={stealth}
              onCheckedChange={(v) => {
                persistStealth(v);
                toast.success(v ? "Incognito on — history won't be saved" : "Incognito off");
              }}
            />
          </Row>

          {!signedIn && (
            <>
              <Link
                to="/login"
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 px-4 py-3 border-b border-border text-sm font-medium"
              >
                <LogIn className="size-5 text-accent" /> Login
              </Link>
              <Link
                to="/signup"
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 px-4 py-3 border-b border-border text-sm font-medium"
              >
                <UserPlus className="size-5 text-primary" /> Sign up
              </Link>
            </>
          )}

          <Link
            to="/streamer"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 px-4 py-3 border-b border-border text-sm font-medium"
          >
            <Radio className="size-5 text-primary" /> Join streaming
          </Link>

          <Link
            to="/advertise"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 px-4 py-3 border-b border-border text-sm font-medium"
          >
            <Megaphone className="size-5 text-gold" /> Advertise
          </Link>

          <Link
            to="/extension"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 px-4 py-3 border-b border-border text-sm font-medium"
          >
            <Puzzle className="size-5 text-accent" /> Extension
          </Link>

          {signedIn && (
            <button
              onClick={() => {
                onOpenChange(false);
                void logOut();
                toast.success("Logged out");
                navigate({ to: "/login" });
              }}
              className="flex w-full items-center gap-3 px-4 py-3 border-b border-border text-left text-sm font-medium text-destructive"
            >
              <LogOut className="size-5" /> Logout
            </button>
          )}
        </div>
  );

  if (desktop) {
    return (
      <aside
        aria-label="Settings"
        aria-hidden={!open}
        className={`fixed left-0 top-0 z-40 h-screen w-80 overflow-y-auto border-r border-border bg-background transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold">Settings</h2>
          <button aria-label="Close menu" onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
        </div>
        {body}
      </aside>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[86vw] max-w-sm border-border bg-background p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="font-display text-lg">Settings</SheetTitle>
        </SheetHeader>
        {body}
      </SheetContent>
    </Sheet>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
      {icon}
      <span className="flex-1 text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}
