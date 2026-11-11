import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { UserPlus, Mail, User, Lock } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/account";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Create your Sexplosive account" },
      {
        name: "description",
        content: "Create a free Sexplosive account with a username, email and password to stream, connect and go live.",
      },
      { property: "og:title", content: "Sign up — Sexplosive" },
      { property: "og:description", content: "Create a free Sexplosive account in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || password.length < 6) {
      toast.error("Enter a username, a valid email and a 6+ character password");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await signUp(username.trim(), email.trim(), password);
      toast.success(`Account created — welcome, ${username}`);
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-md">
        <form onSubmit={submit} className="space-y-4 rounded-3xl surface-card sheen p-6 sm:p-8">
          <div className="text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent/20 text-accent">
              <UserPlus className="size-7" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold glow-text">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Adults only · 18+</p>
          </div>

          <Field icon={<User className="size-4 text-accent" />} label="Username">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="neonrider" autoComplete="username" maxLength={40} />
          </Field>
          <Field icon={<Mail className="size-4 text-accent" />} label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" maxLength={255} />
          </Field>
          <Field icon={<Lock className="size-4 text-accent" />} label="Password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" maxLength={128} />
          </Field>
          <Field icon={<Lock className="size-4 text-accent" />} label="Confirm password">
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" autoComplete="new-password" maxLength={128} />
          </Field>

          <Button type="submit" size="lg" disabled={loading} className="w-full rounded-full">
            {loading ? "Creating account…" : "Sign up"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-accent hover:underline">
              Log in
            </Link>
          </p>
          <p className="text-center text-xs text-muted-foreground">
            By continuing you accept the{" "}
            <Link to="/terms" className="text-accent hover:underline">
              Terms &amp; Conditions
            </Link>
            .
          </p>
        </form>
      </div>
    </SiteLayout>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {icon} {label}
      </span>
      {children}
    </label>
  );
}
