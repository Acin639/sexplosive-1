import { Spinner } from "./Spinner";
import { Button } from "@/components/ui/button";

export function MediaLoadState({ pending, error, retry }: { pending: boolean; error: Error | null; retry: () => void }) {
  if (pending) return <div className="grid min-h-48 place-items-center"><Spinner label="Loading media" /></div>;
  if (error) return <div className="space-y-3 py-8"><p role="alert">Could not load this collection.</p><Button onClick={retry}>Try again</Button></div>;
  return null;
}