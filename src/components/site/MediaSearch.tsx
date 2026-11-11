import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchHome, type ApiVideo } from "@/lib/api-client";
import { findCreatorName } from "@/lib/gallery-media";
import { categoryCatalog } from "@/lib/category-catalog";

export function MediaSearch({ videos = [] }: { videos?: ApiVideo[] }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["home", 100], queryFn: () => fetchHome(100) });

  function search() {
    const term = query.trim();
    if (!term) return;
    const creator = findCreatorName(term, [...videos, ...(data?.videos ?? [])]);
    const category = categoryCatalog().find(item => item.title.toLowerCase() === term.toLowerCase());
    if (creator) void navigate({ to: "/creator/$name", params: { name: creator } });
    else if (category?.slug === "gallery") void navigate({ to: "/gallery" });
    else if (category) void navigate({ to: "/gallery/$category", params: { category: category.slug } });
    else void navigate({ to: "/results", search: { q: term } });
  }

  return <form role="search" aria-label="Search images and creators" className="mb-6 flex w-full max-w-xl items-center gap-2" onSubmit={event => { event.preventDefault(); search(); }}>
    <Input type="search" aria-label="Search images or people" placeholder="Search images or people" value={query} onChange={event => setQuery(event.target.value)} className="h-11 min-w-0 flex-1 bg-secondary/40" />
    <Button type="submit" size="icon" aria-label="Search images and people" disabled={!query.trim()} className="size-11 shrink-0"><Search className="size-5" /></Button>
  </form>;
}