import { createFileRoute } from "@tanstack/react-router";
import { buildVideos, clampLimit } from "@/lib/mock-videos";

export const Route = createFileRoute("/api/home")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const limit = clampLimit(url.searchParams.get("limit"), 10);
        const videos = buildVideos("home", limit);
        return Response.json({ success: true, count: videos.length, videos });
      },
    },
  },
});
