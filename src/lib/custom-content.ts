import { useEffect, useState } from "react";
import { onValue, push, ref, remove, set } from "firebase/database";
import { db } from "@/lib/firebase";

export type PremiumItem = { title: string; thumbnail: string; videoUrl: string };
export type PremiumSuggestions = { enabled: boolean; items: PremiumItem[] };
const EMPTY_ITEM: PremiumItem = { title: "", thumbnail: "", videoUrl: "" };
export const emptyPremium = (): PremiumSuggestions => ({ enabled: false, items: [{ ...EMPTY_ITEM }, { ...EMPTY_ITEM }, { ...EMPTY_ITEM }] });

/** Normalises stored premium suggestions to exactly three slots. */
export function normalizePremium(raw: unknown): PremiumSuggestions {
  const base = emptyPremium();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<PremiumSuggestions>;
  const items = Array.isArray(r.items) ? r.items : Object.values(r.items ?? {});
  return { enabled: !!r.enabled, items: base.items.map((d, i) => ({ ...d, ...(items[i] as PremiumItem | undefined) })) };
}

export function usePremiumSuggestions() {
  const [v, setV] = useState<PremiumSuggestions>(emptyPremium);
  useEffect(() => onValue(ref(db, "settings/premiumSuggestions"), (s) => setV(normalizePremium(s.val()))), []);
  return v;
}
export const savePremiumSuggestions = (v: PremiumSuggestions) => set(ref(db, "settings/premiumSuggestions"), v);

export type CustomLegend = { id: string; name: string; avatar: string; nationality?: string; age?: string; ethnicity?: string };

export function useCustomLegends() {
  const [list, setList] = useState<CustomLegend[]>([]);
  useEffect(
    () =>
      onValue(ref(db, "legends"), (s) => {
        const val = (s.val() ?? {}) as Record<string, Omit<CustomLegend, "id">>;
        setList(Object.entries(val).map(([id, l]) => ({ id, ...l })).filter((l) => l.name));
      }),
    [],
  );
  return list;
}
export const addCustomLegend = (l: Omit<CustomLegend, "id">) => push(ref(db, "legends"), l);
export const deleteCustomLegend = (id: string) => remove(ref(db, `legends/${id}`));
