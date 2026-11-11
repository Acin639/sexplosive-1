import { createFileRoute } from "@tanstack/react-router";
import { buildVideos, videoFromId } from "@/lib/mock-videos";

export const Route = createFileRoute("/api/video")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const id = (url.searchParams.get("id") ?? "").trim();
        if (!id) {
          return Response.json({ success: false, error: "Missing query parameter: id" }, { status: 400 });
        }
        const video = videoFromId(id);
        return Response.json({
          success: true,
          video,
          related: buildVideos(`related-${id}`, 8),
        });
      },
    },
  },
});
