import { Link } from "@tanstack/react-router";
import { History, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { STATE_BY_NAME } from "@/data/states";
import { useClearHistory, useRecentCities } from "@/lib/history";

export function RecentCities({ onPick }: { onPick?: (state: string, city: string) => void }) {
  const { data, isLoading } = useRecentCities();
  const clear = useClearHistory();

  return (
    <div className="postcard p-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <History className="size-4 text-neon-cyan" /> Recently viewed
        </h3>
        {data && data.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={async () => {
              try {
                await clear();
                toast.success("History cleared");
              } catch {
                toast.error("Couldn't clear history");
              }
            }}
          >
            <Trash2 className="size-3.5" /> Clear
          </Button>
        )}
      </div>
      {isLoading ? (
        <div className="mt-3 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-9 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Cities you open will show up here — your last 5.
        </p>
      ) : (
        <ol className="mt-3 space-y-1.5">
          {data.map((c, i) => {
            const slug = STATE_BY_NAME.get(c.state_name)?.slug;
            const inner = (
              <>
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-neon-cyan/40 text-[11px] font-bold text-neon-cyan">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{c.city_name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {c.state_name}
                  </span>
                </span>
                <MapPin className="size-3.5 text-muted-foreground" />
              </>
            );
            const cls =
              "flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent";
            return (
              <li key={`${c.state_name}-${c.city_name}`}>
                {onPick ? (
                  <button
                    type="button"
                    className={cls}
                    onClick={() => onPick(c.state_name, c.city_name)}
                  >
                    {inner}
                  </button>
                ) : slug ? (
                  <Link
                    to="/state/$slug"
                    params={{ slug }}
                    search={{ city: c.city_name }}
                    className={cls}
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className={cls}>{inner}</div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
