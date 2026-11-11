import { createFileRoute } from "@tanstack/react-router";
import { buildVideos, clampLimit, resolvePages } from "@/lib/mock-videos";

export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const q = (url.searchParams.get("q") ?? "").trim();

        if (!q) {
          return Response.json({ success: false, error: "Missing query parameter: q" }, { status: 400 });
        }

        const limit = clampLimit(url.searchParams.get("limit"), 20);
        const pages = resolvePages(url.searchParams.get("pages"));
        const page = clampLimit(url.searchParams.get("page"), 1, 10);

        const videos = Array.from({ length: pages }, (_, p) =>
          buildVideos(`${q.toLowerCase()}-p${page + p}`, limit, q),
        ).flat();

        return Response.json({ success: true, query: q, page, pages, count: videos.length, videos });
      },
    },
  },
});
