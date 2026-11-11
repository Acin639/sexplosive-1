import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Plain circular spinner used wherever media or data is still loading. */
export function Spinner({ size = "lg", label = "Loading", className }: { size?: "sm" | "lg"; label?: string; className?: string }) {
  return (
    <span role="status" aria-label={label} className={cn("inline-grid place-items-center", className)}>
      <Loader2 className={cn("animate-spin", size === "sm" ? "size-4" : "size-8")} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
