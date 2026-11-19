import { useEffect, useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";

import { cn } from "@/lib/utils";

const FILLS = [
  "fill-map-1",
  "fill-map-2",
  "fill-map-3",
  "fill-map-4",
  "fill-map-5",
  "fill-map-6",
  "fill-map-7",
  "fill-map-8",
];

type Props = {
  /** URL of a GeoJSON file under /geo */
  src: string;
  /** Property holding each region's name */
  nameKey: string;
  width?: number;
  height?: number;
  selected?: string | null;
  onSelect?: (name: string) => void;
  /** Show labels on regions larger than this share of the map */
  labelMinArea?: number;
  className?: string;
  ariaLabel: string;
  onNames?: (names: string[]) => void;
};

type Props2 = Record<string, unknown>;

export function GeoMap({
  src,
  nameKey,
  width = 800,
  height = 900,
  selected,
  onSelect,
  labelMinArea = 0.012,
  className,
  ariaLabel,
  onNames,
}: Props) {
  const [data, setData] = useState<FeatureCollection<Geometry, Props2> | null>(null);
  const [failed, setFailed] = useState(false);
  const [hover, setHover] = useState<{ name: string; x: number; y: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setFailed(false);
    fetch(src)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((json) => !cancelled && setData(json))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [src]);

  const shapes = useMemo(() => {
    if (!data) return [];
    const projection = geoMercator().fitExtent(
      [
        [12, 12],
        [width - 12, height - 12],
      ],
      data,
    );
    const path = geoPath(projection);
    const total = width * height;
    return data.features
      .map((f: Feature<Geometry, Props2>, i) => {
        const name = String(f.properties?.[nameKey] ?? `Region ${i + 1}`);
        const d = path(f) ?? "";
        const area = path.area(f) / total;
        const [cx, cy] = path.centroid(f);
        return { name, d, area, cx, cy, fill: FILLS[hash(name) % FILLS.length] };
      })
      .filter((s) => s.d);
  }, [data, nameKey, width, height]);

  useEffect(() => {
    if (shapes.length) onNames?.(Array.from(new Set(shapes.map((s) => s.name))).sort());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapes]);

  if (failed) {
    return (
      <div className="flex aspect-[8/9] items-center justify-center text-sm text-muted-foreground">
        The map couldn't load. Please refresh the page.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex aspect-[8/9] items-center justify-center">
        <div className="size-10 animate-spin rounded-full border-4 border-secondary border-t-primary" />
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
        className="h-auto w-full animate-map-pop"
        onMouseLeave={() => setHover(null)}
      >
        {shapes.map((s) => (
          <path
            key={s.name}
            d={s.d}
            tabIndex={0}
            role="button"
            aria-label={s.name}
            className={cn("map-region", s.fill, selected === s.name && "map-region-active")}
            onClick={() => onSelect?.(s.name)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.(s.name);
              }
            }}
            onMouseMove={(e) => {
              const box = (
                e.currentTarget.ownerSVGElement as SVGSVGElement
              ).getBoundingClientRect();
              setHover({ name: s.name, x: e.clientX - box.left, y: e.clientY - box.top });
            }}
          />
        ))}
        {shapes
          .filter((s) => s.area >= labelMinArea)
          .map((s) => (
            <text
              key={`l-${s.name}`}
              x={s.cx}
              y={s.cy}
              textAnchor="middle"
              dominantBaseline="middle"
              className="pointer-events-none fill-ink text-[11px] font-semibold"
              style={{ paintOrder: "stroke", stroke: "var(--paper)", strokeWidth: 3 }}
            >
              {s.name}
            </text>
          ))}
      </svg>
      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[130%] rounded-full bg-ink px-3 py-1 text-xs font-semibold whitespace-nowrap text-paper shadow-lift"
          style={{ left: hover.x, top: hover.y }}
        >
          {hover.name}
        </div>
      )}
    </div>
  );
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
