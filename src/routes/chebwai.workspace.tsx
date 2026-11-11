import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Code2, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AdminGate } from "@/components/site/AdminGate";
import { MailWorkspace } from "@/components/site/MailWorkspace";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePasswords, type PasswordKind } from "@/lib/admin-auth";

export const Route = createFileRoute("/chebwai/workspace")({
  head: () => ({
    meta: [
      { title: "Workspaces — Sexplosive" },
      { name: "description", content: "Private Sexplosive workspaces: developer and creator mail consoles." },
      { property: "og:title", content: "Workspaces — Sexplosive" },
      { property: "og:description", content: "Developer and creator workspaces for Sexplosive." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AdminGate title="Chebwai">
      <WorkspacePage />
    </AdminGate>
  ),
});

type WorkspaceId = "developer" | "creator";

function WorkspacePage() {
  const [workspace, setWorkspace] = useState<WorkspaceId | null>(null);

  return (
    <SiteLayout>
      <div className="space-y-6">
        <header className="flex items-center gap-3">
          <Link
            to="/chebwai"
            aria-label="Back to console"
            className="grid size-10 shrink-0 place-items-center rounded-full surface-card"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl glow-text">Workspaces</h1>
            <p className="text-sm text-muted-foreground">Pick a workspace — each one has its own password.</p>
          </div>
        </header>

        {!workspace ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <WorkspaceCard
              icon={Code2}
              title="Developer"
              description="Mail plus full overview, ads manager and password controls."
              onOpen={() => setWorkspace("developer")}
            />
            <WorkspaceCard
              icon={Sparkles}
              title="Creator"
              description="A clean mailing workspace with all the everyday features."
              onOpen={() => setWorkspace("creator")}
            />
          </div>
        ) : (
          <WorkspaceGate
            workspace={workspace}
            onBack={() => setWorkspace(null)}
          />
        )}
      </div>
    </SiteLayout>
  );
}

function WorkspaceCard({
  icon: Icon,
  title,
  description,
  onOpen,
}: {
  icon: typeof Code2;
  title: string;
  description: string;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="rounded-3xl surface-card sheen p-6 text-left tilt-hover"
    >
      <span className="grid size-14 place-items-center rounded-2xl bg-gold/20 text-gold">
        <Icon className="size-7" />
      </span>
      <h2 className="mt-4 font-display text-xl font-bold">{title} workspace</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent">
        <Lock className="size-4" /> Password required
      </span>
    </button>
  );
}

function WorkspaceGate({ workspace, onBack }: { workspace: WorkspaceId; onBack: () => void }) {
  const passwords = usePasswords();
  const [pass, setPass] = useState("");
  const [ok, setOk] = useState(false);

  if (ok) {
    return (
      <div className="space-y-4">
        <Button variant="secondary" className="rounded-full" onClick={onBack}>
          <ArrowLeft className="mr-2 size-4" /> All workspaces
        </Button>
        <MailWorkspace variant={workspace} />
      </div>
    );
  }

  const kind: PasswordKind = workspace;

  return (
    <div className="mx-auto max-w-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (pass === passwords[kind]) setOk(true);
          else toast.error("Wrong workspace password");
        }}
        className="space-y-4 rounded-3xl surface-card sheen p-6 text-center"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-gold/20 text-gold">
          <Lock className="size-7" />
        </span>
        <h2 className="font-display text-2xl font-bold glow-text capitalize">{workspace} workspace</h2>
        <p className="text-sm text-muted-foreground">Enter the {workspace} password to continue.</p>
        <Input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Workspace password"
          maxLength={64}
        />
        <Button type="submit" size="lg" className="w-full rounded-full">
          Unlock
        </Button>
        <Button type="button" variant="ghost" className="w-full rounded-full" onClick={onBack}>
          Back
        </Button>
      </form>
    </div>
  );
}
