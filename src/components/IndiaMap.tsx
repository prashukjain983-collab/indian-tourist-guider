import { useEffect, useMemo, useRef, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";

import { cn } from "@/lib/utils";

// Each region glows in one neon colour: tinted fill, bright outline, glow from currentColor.
const PALETTE = [
  "text-map-1 fill-map-1 stroke-map-1",
  "text-map-2 fill-map-2 stroke-map-2",
  "text-map-3 fill-map-3 stroke-map-3",
  "text-map-4 fill-map-4 stroke-map-4",
  "text-map-5 fill-map-5 stroke-map-5",
  "text-map-6 fill-map-6 stroke-map-6",
  "text-map-7 fill-map-7 stroke-map-7",
  "text-map-8 fill-map-8 stroke-map-8",
];

const ZOOM_MS = 900;

type Props = {
  /** URL of a GeoJSON file under /geo */
  src: string;
  /** Property holding each region's name */
  nameKey: string;
  width?: number;
  height?: number;
  selected?: string | null;
  onSelect?: (name: string) => void;
  /** Zoom into the clicked region before calling onSelect */
  zoomOnSelect?: boolean;
  /** Show labels on regions larger than this share of the map */
  labelMinArea?: number;
  className?: string;
  ariaLabel: string;
  onNames?: (names: string[]) => void;
  /** Regions that always get a glowing marker and a label (e.g. island territories) */
  highlight?: string[];
  /** Regions smaller than this share of the map get a glowing marker */
  markerMaxArea?: number;
  /** Also label every small-region marker */
  labelMarkers?: boolean;
};

type Shape = {
  name: string;
  d: string;
  area: number;
  cx: number;
  cy: number;
  bounds: [[number, number], [number, number]];
  palette: string;
};

export function GeoMap({
  src,
  nameKey,
  width = 800,
  height = 900,
  selected,
  onSelect,
  zoomOnSelect = false,
  labelMinArea = 0.012,
  className,
  ariaLabel,
  onNames,
  highlight = [],
  markerMaxArea = 0.0015,
  labelMarkers = false,
}: Props) {
  const [data, setData] = useState<FeatureCollection<Geometry, Record<string, unknown>> | null>(
    null,
  );
  const [failed, setFailed] = useState(false);
  const [hover, setHover] = useState<{ name: string; x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState<{
    name: string;
    transform: string;
    cx: number;
    cy: number;
  } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setFailed(false);
    setZoom(null);
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

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const shapes = useMemo<Shape[]>(() => {
    if (!data) return [];
    const projection = geoMercator().fitExtent(
      [
        [16, 16],
        [width - 16, height - 16],
      ],
      data,
    );
    const path = geoPath(projection);
    const total = width * height;
    return data.features
      .map((f: Feature<Geometry, Record<string, unknown>>, i) => {
        const name = String(f.properties?.[nameKey] ?? `Region ${i + 1}`);
        const [cx, cy] = path.centroid(f);
        return {
          name,
          d: path(f) ?? "",
          area: path.area(f) / total,
          cx,
          cy,
          bounds: path.bounds(f) as [[number, number], [number, number]],
          palette: PALETTE[i % PALETTE.length] ?? PALETTE[0]!,
        };
      })
      .filter((s) => s.d);
  }, [data, nameKey, width, height]);

  useEffect(() => {
    if (shapes.length) onNames?.(Array.from(new Set(shapes.map((s) => s.name))).sort());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapes]);

  function choose(shape: Shape) {
    if (zoom) return;
    if (!zoomOnSelect) {
      onSelect?.(shape.name);
      return;
    }
    const [[x0, y0], [x1, y1]] = shape.bounds;
    const bw = Math.max(x1 - x0, 1);
    const bh = Math.max(y1 - y0, 1);
    const k = Math.min(10, 0.75 * Math.min(width / bw, height / bh));
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    const tx = width / 2 - k * mx;
    const ty = height / 2 - k * my;
    setHover(null);
    setZoom({
      name: shape.name,
      transform: `translate(${tx}px, ${ty}px) scale(${k})`,
      cx: mx,
      cy: my,
    });
    timer.current = setTimeout(() => onSelect?.(shape.name), ZOOM_MS);
  }

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
        <div className="size-10 animate-spin rounded-full border-4 border-secondary border-t-neon-cyan" />
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
        className="h-auto w-full overflow-visible"
        onMouseLeave={() => setHover(null)}
      >
        <g
          style={{
            transformOrigin: "0 0",
            transform: zoom?.transform ?? "none",
            transition: `transform ${ZOOM_MS}ms cubic-bezier(0.7, 0, 0.2, 1)`,
          }}
        >
          {shapes.map((s, i) => (
            <path
              key={s.name}
              d={s.d}
              pathLength={1}
              vectorEffect="non-scaling-stroke"
              tabIndex={0}
              role="button"
              aria-label={s.name}
              style={{ animationDelay: `${Math.min(i * 35, 900)}ms` }}
              className={cn(
                "map-region animate-region-draw",
                s.palette,
                (s.area < markerMaxArea || highlight.includes(s.name)) && "map-region-island",
                (selected === s.name || zoom?.name === s.name) && "map-region-active",
                zoom && zoom.name !== s.name && "map-region-dim",
              )}
              onClick={() => choose(s)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  choose(s);
                }
              }}
              onMouseMove={(e) => {
                if (zoom) return;
                const box = (
                  e.currentTarget.ownerSVGElement as SVGSVGElement
                ).getBoundingClientRect();
                setHover({ name: s.name, x: e.clientX - box.left, y: e.clientY - box.top });
              }}
            />
          ))}
          {!zoom &&
            shapes
              .filter((s) => s.area < markerMaxArea || highlight.includes(s.name))
              .map((s) => {
                const showLabel = labelMarkers || highlight.includes(s.name);
                return (
                  <g
                    key={`m-${s.name}`}
                    className={cn("cursor-pointer", s.palette)}
                    onClick={() => choose(s)}
                    aria-hidden="true"
                  >
                    <circle
                      cx={s.cx}
                      cy={s.cy}
                      r={14}
                      className="map-marker-pulse fill-none"
                      strokeWidth={2}
                    />
                    <circle
                      cx={s.cx}
                      cy={s.cy}
                      r={6}
                      fillOpacity={0.9}
                      style={{ filter: "drop-shadow(0 0 6px currentColor)" }}
                    />
                    <circle cx={s.cx} cy={s.cy} r={18} fill="transparent" stroke="none" />
                    {showLabel && (
                      <text
                        x={s.cx}
                        y={s.cy + 30}
                        textAnchor="middle"
                        className="pointer-events-none fill-current text-[13px] font-bold"
                        style={{ paintOrder: "stroke", stroke: "var(--paper)", strokeWidth: 4 }}
                      >
                        {s.name}
                      </text>
                    )}
                  </g>
                );
              })}
          {!zoom &&
            shapes
              .filter((s) => s.area >= labelMinArea)
              .map((s) => (
                <text
                  key={`l-${s.name}`}
                  x={s.cx}
                  y={s.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none animate-map-pop fill-ink text-[11px] font-semibold"
                  style={{
                    paintOrder: "stroke",
                    stroke: "var(--paper)",
                    strokeWidth: 3,
                    animationDelay: "900ms",
                  }}
                >
                  {s.name}
                </text>
              ))}
        </g>
      </svg>

      {zoom && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="absolute size-40 rounded-full border-2 border-neon-cyan shadow-neon-cyan animate-zoom-burst" />
          <p className="neon-text animate-page-enter font-display text-4xl sm:text-5xl">
            {zoom.name}
          </p>
        </div>
      )}

      {hover && !zoom && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[130%] rounded-full border border-neon-cyan bg-popover px-3 py-1 text-xs font-semibold whitespace-nowrap text-neon-cyan shadow-neon-cyan"
          style={{ left: hover.x, top: hover.y }}
        >
          {hover.name}
        </div>
      )}
    </div>
  );
}
