import { useEffect } from "react";
import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { isChunkLoadError, recoverChunkLoad } from "@/lib/chunk-recovery";
import { reportLovableError } from "@/lib/lovable-error-reporting";

export function RouteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  const chunkError = isChunkLoadError(error);
  useEffect(() => {
    if (!recoverChunkLoad(error)) {
      reportLovableError(error, { boundary: "route_error" });
    }
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">This page didn’t load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {chunkError ? "Refresh to load the latest page, or try again when your connection returns." : "Please try again or head back home."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={() => {
            if (chunkError) window.location.reload();
            else void router.invalidate().then(() => reset());
          }}>{chunkError ? "Refresh page" : "Try again"}</Button>
          <Button variant="outline" asChild><a href="/">Go home</a></Button>
        </div>
      </div>
    </div>
  );
}