import { useEffect, useState } from "react";
import { Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  addCustomLegend,
  deleteCustomLegend,
  savePremiumSuggestions,
  useCustomLegends,
  usePremiumSuggestions,
  type PremiumSuggestions,
} from "@/lib/custom-content";

/** Developer form for the three locked premium suggestions on the watch page. */
export function PremiumSuggestionsPanel() {
  const stored = usePremiumSuggestions();
  const [draft, setDraft] = useState<PremiumSuggestions>(stored);
  useEffect(() => setDraft(stored), [stored]);

  const setItem = (i: number, k: "title" | "thumbnail" | "videoUrl", v: string) =>
    setDraft((d) => ({ ...d, items: d.items.map((it, j) => (j === i ? { ...it, [k]: v } : it)) }));

  return (
    <section className="space-y-4 border border-border p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-bold">Premium suggestions</h3>
          <p className="text-sm text-muted-foreground">The first three suggestions on the watch page, shown locked.</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          {draft.enabled ? "On" : "Off"}
          <Switch
            checked={draft.enabled}
            onCheckedChange={(v) => {
              const next = { ...draft, enabled: v };
              setDraft(next);
              void savePremiumSuggestions(next).then(() => toast.success(v ? "Premium suggestions on" : "Premium suggestions off"));
            }}
          />
        </label>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {draft.items.map((it, i) => (
          <div key={i} className="space-y-2 border border-border p-3">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold"><Lock className="size-3.5" /> Slot {i + 1}</p>
            <Input placeholder="Title" value={it.title} maxLength={140} onChange={(e) => setItem(i, "title", e.target.value)} />
            <Input placeholder="Thumbnail URL" value={it.thumbnail} onChange={(e) => setItem(i, "thumbnail", e.target.value)} />
            <Input placeholder="Video URL" value={it.videoUrl} onChange={(e) => setItem(i, "videoUrl", e.target.value)} />
            {it.thumbnail && <img src={it.thumbnail} alt="" className="aspect-video w-full object-cover" />}
          </div>
        ))}
      </div>
      <Button onClick={() => void savePremiumSuggestions(draft).then(() => toast.success("Premium suggestions saved"))}>Save suggestions</Button>
    </section>
  );
}

/** Developer form for adding legends that always appear on /legends. */
export function LegendsPanel() {
  const legends = useCustomLegends();
  const [f, setF] = useState({ name: "", avatar: "", nationality: "", age: "", ethnicity: "" });
  const submit = async () => {
    if (!f.name.trim() || !f.avatar.trim()) return toast.error("Name and picture URL are required");
    await addCustomLegend({ ...f, name: f.name.trim(), avatar: f.avatar.trim() });
    setF({ name: "", avatar: "", nationality: "", age: "", ethnicity: "" });
    toast.success("Legend added");
  };
  return (
    <section className="space-y-4 border border-border p-5">
      <div>
        <h3 className="font-display text-lg font-bold">Legends</h3>
        <p className="text-sm text-muted-foreground">Each legend added here gets its own box on the Legends page.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {(["name", "avatar", "nationality", "age", "ethnicity"] as const).map((k) => (
          <Input key={k} placeholder={k === "avatar" ? "Picture URL" : k[0].toUpperCase() + k.slice(1)} value={f[k]} maxLength={k === "avatar" ? 2000 : 80} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
        ))}
      </div>
      <Button onClick={() => void submit()}>Add legend</Button>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {legends.map((l) => (
          <div key={l.id} className="relative border border-border">
            <img src={l.avatar} alt={l.name} className="aspect-[3/4] w-full object-cover" />
            <p className="truncate p-2 text-sm font-semibold">{l.name}</p>
            <button aria-label={`Delete ${l.name}`} onClick={() => confirm(`Delete ${l.name}?`) && void deleteCustomLegend(l.id)} className="absolute right-2 top-2 grid size-8 place-items-center bg-background/85 hover:text-destructive"><Trash2 className="size-4" /></button>
          </div>
        ))}
      </div>
    </section>
  );
}
