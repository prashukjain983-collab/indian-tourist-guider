import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";

import { GeoMap } from "@/components/IndiaMap";
import { Input } from "@/components/ui/input";
import { STATES, STATE_BY_NAME } from "@/data/states";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/explore")({
  head: () => ({
    meta: [
      { title: "Explore the map — Indian Tourist Guider" },
      {
        name: "description",
        content: "Click any Indian state or union territory on the map to open its travel guide.",
      },
      { property: "og:title", content: "Explore India on the map — Indian Tourist Guider" },
      {
        property: "og:description",
        content: "Click any state to open its culture, food, monuments and cities.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const navigate = useNavigate();
  const { displayName } = useAuth();
  const [hovered, setHovered] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return STATES.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const preview = hovered ? STATE_BY_NAME.get(hovered) : null;
  const uts = STATES.filter((s) => s.type === "Union Territory");

  function open(name: string) {
    const s = STATE_BY_NAME.get(name);
    if (s) navigate({ to: "/state/$slug", params: { slug: s.slug } });
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_380px]">
      <section className="postcard relative overflow-hidden p-4 sm:p-6">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold sm:text-4xl">
              Where to next{displayName ? `, ${displayName.split(" ")[0]}` : ""}?
            </h1>
            <p className="text-muted-foreground">Click a state to open its map and pick a city.</p>
          </div>
        </div>
        <div
          className="mx-auto max-w-2xl"
          onMouseOver={(e) => {
            const label = (e.target as Element).getAttribute?.("aria-label");
            if (label && STATE_BY_NAME.has(label)) setHovered(label);
          }}
        >
          <GeoMap
            src="/geo/india.json"
            nameKey="st_nm"
            ariaLabel="Map of India — click a state"
            onSelect={open}
            labelMinArea={0.018}
          />
        </div>
      </section>

      <aside className="space-y-5">
        <div className="postcard p-5">
          <Label className="text-sm font-semibold">Find a state or UT</Label>
          <div className="relative mt-2">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Kerala, Goa, Ladakh"
              className="pl-9"
              onKeyDown={(e) => {
                if (e.key === "Enter" && matches[0]) open(matches[0].name);
              }}
            />
          </div>
          {matches.length > 0 && (
            <ul className="mt-2 overflow-hidden rounded-lg border bg-card">
              {matches.map((m) => (
                <li key={m.slug}>
                  <Link
                    to="/state/$slug"
                    params={{ slug: m.slug }}
                    className="flex items-center justify-between px-3 py-2 text-sm hover:bg-accent"
                  >
                    {m.name}
                    <span className="text-xs text-muted-foreground">{m.type}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="postcard min-h-[220px] p-5">
          {preview ? (
            <div key={preview.slug} className="animate-map-pop">
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                {preview.type}
              </p>
              <h2 className="mt-1 text-2xl font-semibold">{preview.name}</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="font-semibold">Culture</dt>
                  <dd className="text-muted-foreground">{preview.culture}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Language</dt>
                  <dd className="text-muted-foreground">{preview.language}</dd>
                </div>
                {preview.bestTime && (
                  <div>
                    <dt className="font-semibold">Best time</dt>
                    <dd className="text-muted-foreground">{preview.bestTime}</dd>
                  </div>
                )}
              </dl>
              <Link
                to="/state/$slug"
                params={{ slug: preview.slug }}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Open {preview.name} <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <div className="flex h-full flex-col justify-center text-muted-foreground">
              <p className="font-display text-xl text-foreground">Hover over the map</p>
              <p className="mt-1 text-sm">A quick preview of each state shows up here.</p>
            </div>
          )}
        </div>

        <div className="postcard p-5">
          <h3 className="text-sm font-semibold">Small union territories</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {uts.map((u) => (
              <Link
                key={u.slug}
                to="/state/$slug"
                params={{ slug: u.slug }}
                className="rounded-full border bg-background px-3 py-1 text-xs font-medium hover:border-primary hover:text-primary"
              >
                {u.name}
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={className}>{children}</p>;
}
