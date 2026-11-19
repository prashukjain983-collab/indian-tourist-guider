import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/city-info")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleCityInfo } = await import("@/lib/ai/city-info.server");
        return handleCityInfo(request);
      },
    },
  },
});
