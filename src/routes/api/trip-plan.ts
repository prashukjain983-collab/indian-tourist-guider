import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trip-plan")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleTripPlan } = await import("@/lib/ai/trip-plan.server");
        return handleTripPlan(request);
      },
    },
  },
});
