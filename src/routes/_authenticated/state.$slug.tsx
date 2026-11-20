import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Landmark, MapPin, Mountain, Search, Sun, UtensilsCrossed } from "lucide-react";

import { CityGuide } from "@/components/CityGuide";
import { GeoMap } from "@/components/IndiaMap";
import { Input } from "@/components/ui/input";
import { RecentCities } from "@/components/RecentCities";
import { STATE_BY_NAME, STATE_BY_SLUG } from "@/data/states";
import { useRecordCityView } from "@/lib/history";

export const Route = createFileRoute("/_authenticated/state/$slug")({
  validateSearch: (search: Record<string, unknown>): { city?: string | undefined } => ({
    city: typeof search["city"] === "string" ? search["city"].slice(0, 150) : undefined,
  }),
  loader: ({ params }) => {
    const state = STATE_BY_SLUG.get(params.slug);
    if (!state) throw notFound();
    return { state };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.state.name ?? "State";
    return {
      meta: [
        { title: `${name} travel guide — Indian Tourist Guider` },
        {
          name: "description",
          content: `Explore ${name}: culture, food, monuments, adventures and an AI guide for every city.`,
        },
        { property: "og:title", content: `${name} travel guide — Indian Tourist Guider` },
        {
          property: "og:description",
          content: `Pick a city in ${name} and get an instant AI travel guide.`,
        },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: StatePage,
});

function StatePage() {
  const { state } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const recordView = useRecordCityView();
  const [city, setCity] = useState<string | null>(search.city ?? null);
  const recorded = useRef<string | null>(null);

  useEffect(() => {
    setCity(search.city ?? null);
  }, [search.city, state.slug]);

  useEffect(() => {
    const key = city ? `${state.name}|${city}` : null;
    if (key && recorded.current !== key) {
      recorded.current = key;
      void recordView(state.name, city!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, state.name]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    const all = Array.from(new Set([...state.touristPlaces, ...districts]));
    const q = query.trim().toLowerCase();
    return q ? all.filter((n) => n.toLowerCase().includes(q)).slice(0, 8) : [];
  }, [state, districts, query]);

  const places = useMemo(
    () => Array.from(new Set([...state.touristPlaces, ...state.monuments])),
    [state],
  );

  function pickRecent(stateName: string, cityName: string) {
    const target = STATE_BY_NAME.get(stateName);
    if (!target) return;
    if (target.slug === state.slug) pick(cityName);
    else
      navigate({ to: "/state/$slug", params: { slug: target.slug }, search: { city: cityName } });
  }

  function pick(name: string) {
    setCity(name);
    setQuery("");
    navigate({
      to: "/state/$slug",
      params: { slug: state.slug },
      search: { city: name },
      replace: true,
    });
    if (window.innerWidth < 1024) {
      setTimeout(
        () => document.getElementById("city-guide")?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    }
  }

  return (
    <main key={state.slug} className="animate-page-enter mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Link
        to="/explore"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Back to India map
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-neon-cyan uppercase">
            {state.type}
          </p>
          <h1 className="neon-text animate-flicker text-4xl font-semibold sm:text-5xl">
            {state.name}
          </h1>
          <p className="mt-1 text-muted-foreground">Language: {state.language}</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && options[0] && pick(options[0])}
            placeholder={`Search a city in ${state.name}`}
            className="pl-9"
          />
          {options.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border bg-popover shadow-postcard">
              {options.map((o) => (
                <li key={o}>
                  <button
                    type="button"
                    onClick={() => pick(o)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    <MapPin className="size-3.5 text-primary" /> {o}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <section className="postcard p-4 sm:p-6">
          <p className="mb-2 text-sm text-muted-foreground">
            Click a city or district on the map to get its AI travel guide.
          </p>
          <div className="mx-auto max-w-xl">
            <GeoMap
              key={state.slug}
              src={`/geo/states/${state.slug}.json`}
              nameKey="district"
              ariaLabel={`Map of ${state.name} — click a city`}
              selected={city}
              onSelect={pick}
              onNames={setDistricts}
              markerMaxArea={0.01}
              labelMarkers
              labelMinArea={0.03}
              width={700}
              height={700}
            />
          </div>
          {state.touristPlaces.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold">Popular places</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {state.touristPlaces.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => pick(p)}
                    className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors hover:border-primary hover:text-primary ${city === p ? "border-primary bg-primary text-primary-foreground hover:text-primary-foreground" : "bg-background"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <section id="city-guide" className="space-y-6">
          {city ? (
            <CityGuide
              key={`${state.slug}-${city}`}
              state={state.name}
              city={city}
              places={places}
              onClose={() =>
                navigate({
                  to: "/state/$slug",
                  params: { slug: state.slug },
                  search: {},
                  replace: true,
                })
              }
            />
          ) : (
            <div className="postcard stamp-border relative overflow-hidden p-6">
              <div className="rounded-xl bg-card p-5">
                <p className="font-display text-xl">Pick a city to begin</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  AI MILI will tell you what to see, what to eat and when to go — and you can save
                  it to your places.
                </p>
              </div>
            </div>
          )}

          <RecentCities onPick={pickRecent} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Fact
              icon={<Sun />}
              title="Best time to visit"
              items={state.bestTime ? [state.bestTime] : []}
            />
            <Fact icon={<UtensilsCrossed />} title="Famous food" items={state.cuisines} />
            <Fact icon={<Landmark />} title="Historical monuments" items={state.monuments} />
            <Fact icon={<Mountain />} title="Adventure" items={state.adventures} />
          </div>
          <div className="postcard p-5 text-sm">
            <p>
              <span className="font-semibold">Culture:</span>{" "}
              <span className="text-muted-foreground">{state.culture}</span>
            </p>
            <p className="mt-1">
              <span className="font-semibold">Tradition:</span>{" "}
              <span className="text-muted-foreground">{state.tradition}</span>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Fact({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="postcard p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-neon-cyan [&_svg]:size-4">
        {icon} {title}
      </h3>
      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
        {items.map((i) => (
          <li key={i}>• {i}</li>
        ))}
      </ul>
    </div>
  );
}
