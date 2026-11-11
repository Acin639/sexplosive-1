import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ImagePlus, Radio } from "lucide-react";
import { toast } from "sonner";
import { ref as dbRef, serverTimestamp, update } from "firebase/database";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAccount } from "@/lib/account";
import { db, storage } from "@/lib/firebase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/streamer")({
  head: () => ({
    meta: [
      { title: "Join streaming — Become a Sexplosive streamer" },
      {
        name: "description",
        content: "Set up your streamer profile, pricing and payout. Keep 60% of every stream.",
      },
      { property: "og:title", content: "Join streaming — Sexplosive" },
      { property: "og:description", content: "Keep 60% of every stream you host on Sexplosive." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StreamerPage,
});

const GENDERS = ["Boy", "Girl", "Both", "Bi", "Gay", "Lesbian", "Trans", "Couple"];

/** Read a file as a data URL so the avatar still persists if Storage is unavailable. */
function toDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function StreamerPage() {
  const navigate = useNavigate();
  const { user, signedIn } = useAccount();
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState(GENDERS[0]);
  const [agreed, setAgreed] = useState(false);
  const [mpesa, setMpesa] = useState("");
  const [price, setPrice] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const uploadAvatar = async (uid: string, file: File) => {
    try {
      const path = ref(storage, `streamers/${uid}/avatar-${Date.now()}`);
      await uploadBytes(path, file);
      return await getDownloadURL(path);
    } catch (err) {
      console.warn("[streamer] storage upload failed, embedding image", err);
      if (file.size > 700_000) throw err;
      return toDataUrl(file);
    }
  };

  const submit = async () => {
    if (!user) {
      toast.error("Log in to apply as a streamer");
      navigate({ to: "/login" });
      return;
    }
    if (!displayName.trim()) {
      toast.error("Add the name people will see");
      return;
    }
    if (!mpesa.trim() || !Number(price)) {
      toast.error("Add your M-Pesa number and a stream price");
      return;
    }
    setSaving(true);
    try {
      const avatarUrl = avatar ? await uploadAvatar(user.uid, avatar) : null;

      await update(dbRef(db, `streamers/${user.uid}`), {
        uid: user.uid,
        displayName: displayName.trim(),
        username: displayName.trim(),
        email: user.email,
        gender,
        mpesa: mpesa.trim(),
        price: Number(price),
        payoutShare: 0.6,
        avatarUrl,
        active: true,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      await update(dbRef(db, `users/${user.uid}`), {
        streamer: true,
        username: displayName.trim(),
        avatarUrl,
        updatedAt: serverTimestamp(),
      });
      toast.success("Application saved — you now appear on Connect");
      navigate({ to: "/connect" });
    } catch (err) {
      console.error("[streamer] submit failed", err);
      toast.error(
        err instanceof Error ? `Could not save: ${err.message}` : "Could not submit application",
      );
    } finally {
      setSaving(false);
    }
  };


  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl space-y-5">
        <header>
          <h1 className="font-display text-2xl font-bold sm:text-3xl glow-text">Join streaming</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set up your profile and start earning from live streams.
          </p>
        </header>

        {!signedIn && (
          <p className="rounded-2xl bg-accent/10 p-3 text-xs text-accent">
            <Link to="/login" className="underline">
              Log in
            </Link>{" "}
            or{" "}
            <Link to="/signup" className="underline">
              create an account
            </Link>{" "}
            before applying.
          </p>
        )}

        <section className="rounded-3xl surface-card p-5">
          <h2 className="mb-3 font-display text-base font-bold">Gender</h2>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  gender === g
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-secondary/60 hover:border-accent",
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl surface-card p-5">
          <h2 className="mb-3 font-display text-base font-bold">Your streamer profile</h2>
          <div className="flex items-center gap-4">
            <Upload
              label="Photo"
              className="size-24 shrink-0 rounded-full"
              onFile={setAvatar}
            />
            <div className="min-w-0 flex-1 space-y-2">
              <Input
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={40}
              />
              <p className="text-xs text-muted-foreground">
                This name and photo appear on the Connect page.
              </p>
            </div>
          </div>
        </section>


        <section className="space-y-3 rounded-3xl surface-card p-5">
          <h2 className="font-display text-base font-bold">Payout & pricing</h2>
          <Input
            placeholder="M-Pesa number (07xx xxx xxx)"
            inputMode="tel"
            value={mpesa}
            onChange={(e) => setMpesa(e.target.value)}
            maxLength={255}
          />
          <Input
            placeholder="Price per stream (USD)"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            maxLength={8}
          />
          <p className="rounded-2xl bg-accent/10 p-3 text-xs text-accent">
            You are paid 60% of every stream payment. Payouts are sent to your M-Pesa number weekly.
          </p>
        </section>

        <section className="rounded-3xl surface-card p-5 text-sm text-muted-foreground">
          <h2 className="mb-2 font-display text-base font-bold text-foreground">
            Terms and conditions
          </h2>
          <p>
            Streamers must be 18+ and verify identity. Content must comply with local law and the
            Sexplosive community rules. Sexplosive retains 40% of stream revenue as platform and
            processing fees. Accounts violating the rules may be suspended without payout of
            disputed earnings.
          </p>
          <label className="mt-4 flex items-center gap-3 text-foreground">
            <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(Boolean(v))} />
            <span className="text-sm">I accept the streamer terms</span>
          </label>
        </section>

        <Button size="lg" className="w-full rounded-full" disabled={!agreed || saving} onClick={submit}>
          <Radio className="mr-2 size-4" /> {saving ? "Submitting…" : "Submit application"}
        </Button>
      </div>
    </SiteLayout>
  );
}

function Upload({
  label,
  className,
  onFile,
}: {
  label: string;
  className?: string;
  onFile: (file: File) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  return (
    <label
      className={cn(
        "relative grid w-full cursor-pointer place-items-center overflow-hidden rounded-2xl border border-dashed border-border bg-secondary/40 text-center text-xs text-muted-foreground transition-colors hover:border-accent hover:text-accent",
        className,
      )}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (!file.type.startsWith("image/")) {
            toast.error("Please choose an image file");
            return;
          }
          setPreview((old) => {
            if (old) URL.revokeObjectURL(old);
            return URL.createObjectURL(file);
          });
          onFile(file);
        }}
      />
      {preview ? (
        <>
          <img src={preview} alt={label} className="absolute inset-0 size-full object-cover" />
          <span className="absolute bottom-1 left-1 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-foreground">
            Change
          </span>
        </>
      ) : (
        <span className="flex flex-col items-center gap-1 p-3">
          <ImagePlus className="size-5" />
          {label}
        </span>
      )}
    </label>
  );
}
