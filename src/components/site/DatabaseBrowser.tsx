import { useEffect, useState } from "react";
import { onValue, ref, remove, set } from "firebase/database";
import { Pencil, Trash2, X, Save } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const SECTIONS = [
  { path: "ads", label: "Ads" },
  { path: "users", label: "Users" },
  { path: "payments", label: "Payments" },
  { path: "streamers", label: "Streamers" },
  { path: "settings/pages", label: "Closed pages" },
  { path: "settings/passwords", label: "Passwords" },
  { path: "legends", label: "Legends" },
  { path: "settings/premiumSuggestions", label: "Premium suggestions" },
] as const;

/** Developer view of database contents with edit and delete per entry. */
export function DatabaseBrowser() {
  const [path, setPath] = useState<string>(SECTIONS[0].path);
  const [data, setData] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setEditing(null);
    return onValue(
      ref(db, path),
      (snap) => {
        const v = snap.val();
        setData(v && typeof v === "object" ? v : {});
        setError(null);
      },
      (err) => setError(err.message),
    );
  }, [path]);

  const entries = Object.entries(data);

  const save = async (key: string) => {
    let value: unknown;
    try {
      value = JSON.parse(draft);
    } catch {
      toast.error("Invalid JSON");
      return;
    }
    try {
      await set(ref(db, `${path}/${key}`), value);
      toast.success("Saved");
      setEditing(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    }
  };

  const del = async (key: string) => {
    if (!confirm(`Delete "${key}" from ${path}?`)) return;
    try {
      await remove(ref(db, `${path}/${key}`));
      toast.success("Deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete");
    }
  };

  return (
    <section className="rounded-3xl surface-card p-5">
      <h2 className="font-display text-lg font-bold">Database</h2>
      <p className="mt-1 text-xs text-muted-foreground">Live contents. Edits and deletes are saved immediately.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <Button key={s.path} size="sm" variant={path === s.path ? "default" : "secondary"} className="rounded-full" onClick={() => setPath(s.path)}>
            {s.label}
          </Button>
        ))}
      </div>
      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
      <p className="mt-4 text-xs text-muted-foreground">{entries.length} entries in {path}</p>
      <div className="mt-2 divide-y divide-border/60">
        {entries.length === 0 && <p className="py-3 text-sm text-muted-foreground">Nothing stored here yet.</p>}
        {entries.map(([key, value]) => (
          <div key={key} className="py-3">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-xs font-semibold text-accent">{key}</p>
                {editing !== key && (
                  <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap break-all text-xs text-muted-foreground">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                )}
              </div>
              {editing === key ? (
                <>
                  <button aria-label="Save" onClick={() => save(key)} className="text-muted-foreground hover:text-accent"><Save className="size-4" /></button>
                  <button aria-label="Cancel" onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
                </>
              ) : (
                <>
                  <button aria-label={`Edit ${key}`} onClick={() => { setEditing(key); setDraft(JSON.stringify(value, null, 2)); }} className="text-muted-foreground hover:text-accent"><Pencil className="size-4" /></button>
                  <button aria-label={`Delete ${key}`} onClick={() => del(key)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
                </>
              )}
            </div>
            {editing === key && (
              <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={8} className="mt-2 font-mono text-xs" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
