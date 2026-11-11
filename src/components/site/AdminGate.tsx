import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePasswords } from "@/lib/admin-auth";

const UNLOCK_KEY = "chebwai-unlocked";

export function AdminGate({ title, children }: { title: string; children: React.ReactNode }) {
  const [pass, setPass] = useState("");
  const [ok, setOk] = useState(false);
  const passwords = usePasswords();

  // Unlock lasts for the whole tab so moving between console pages doesn't re-ask.
  useEffect(() => {
    if (sessionStorage.getItem(UNLOCK_KEY) === "1") setOk(true);
  }, []);

  if (ok) return <>{children}</>;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pass === passwords.admin) {
              sessionStorage.setItem(UNLOCK_KEY, "1");
              setOk(true);
            } else toast.error("Wrong admin pass");
          }}
          className="space-y-4 rounded-3xl surface-card sheen p-6 text-center"
        >
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-gold/20 text-gold">
            <Lock className="size-7" />
          </span>
          <h1 className="font-display text-2xl font-bold glow-text">{title}</h1>
          <p className="text-sm text-muted-foreground">Restricted area — enter the admin pass.</p>
          <Input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Admin pass"
            maxLength={64}
          />
          <Button type="submit" size="lg" className="w-full rounded-full">
            Unlock
          </Button>
        </form>
      </div>
    </SiteLayout>
  );
}
