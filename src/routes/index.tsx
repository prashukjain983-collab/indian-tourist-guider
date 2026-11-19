import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Compass, MapPinned } from "lucide-react";

import { AuthCard } from "@/components/AuthCard";
import { GeoMap } from "@/components/IndiaMap";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Indian Tourist Guider" },
      {
        name: "description",
        content:
          "Sign in to explore India on an interactive map, get AI city guides and save your favourite places.",
      },
      { property: "og:title", content: "Indian Tourist Guider — explore India state by state" },
      {
        property: "og:description",
        content:
          "Click any state, pick a city and let AI MILI, your travel guide, tell you what to see and eat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/explore" });
  }, [loading, user, navigate]);

  return (
    <main className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1.1fr_1fr]">
      <section className="order-2 lg:order-1">
        <p className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold tracking-wide text-accent-foreground uppercase">
          <Compass className="size-3.5" /> Your India travel companion
        </p>
        <h1 className="mt-4 text-4xl leading-[1.05] font-semibold sm:text-5xl lg:text-6xl">
          Indian Tourist <span className="text-primary italic">Guider</span>
        </h1>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          Tap a state, choose a city, and AI MILI tells you what to see, eat and do. Save the places
          you love.
        </p>
        <div className="relative mt-6 max-w-md">
          <div className="animate-float-slow">
            <GeoMap
              src="/geo/india.json"
              nameKey="st_nm"
              ariaLabel="Map of India"
              labelMinArea={1}
            />
          </div>
          <div className="absolute right-2 bottom-10 hidden items-center gap-2 rounded-full bg-card px-3 py-1.5 text-sm font-medium shadow-postcard sm:flex">
            <MapPinned className="size-4 text-primary" /> 36 states & union territories
          </div>
        </div>
      </section>
      <section className="order-1 mx-auto w-full max-w-md lg:order-2">
        <h2 className="mb-1 text-2xl font-semibold">Welcome, traveller</h2>
        <p className="mb-5 text-muted-foreground">Sign in or create an account to begin.</p>
        <AuthCard />
      </section>
    </main>
  );
}
