import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type RecentCity = { state_name: string; city_name: string; viewed_at: string };

export const recentCitiesKey = ["recent-cities"] as const;

export function useRecentCities() {
  return useQuery({
    queryKey: recentCitiesKey,
    queryFn: async (): Promise<RecentCity[]> => {
      const { data, error } = await supabase
        .from("city_history")
        .select("state_name, city_name, viewed_at")
        .order("viewed_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      const seen = new Set<string>();
      const out: RecentCity[] = [];
      for (const row of data ?? []) {
        const k = `${row.state_name}|${row.city_name}`;
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(row);
        if (out.length === 5) break;
      }
      return out;
    },
  });
}

export function useRecordCityView() {
  const qc = useQueryClient();
  return async (state: string, city: string) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase
      .from("city_history")
      .insert({ user_id: u.user.id, state_name: state, city_name: city });
    if (error) console.error("Could not record city view", error);
    qc.invalidateQueries({ queryKey: recentCitiesKey });
  };
}

export function useClearHistory() {
  const qc = useQueryClient();
  return async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("city_history").delete().eq("user_id", u.user.id);
    if (error) throw error;
    qc.invalidateQueries({ queryKey: recentCitiesKey });
  };
}
