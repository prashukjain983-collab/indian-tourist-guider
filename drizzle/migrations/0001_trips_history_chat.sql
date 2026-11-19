ALTER TABLE public.saved_places
  ADD COLUMN kind TEXT NOT NULL DEFAULT 'city',
  ADD COLUMN from_location TEXT,
  ADD COLUMN budget TEXT,
  ADD COLUMN transport_mode TEXT,
  ADD COLUMN trip_plan TEXT;
ALTER TABLE public.saved_places ADD CONSTRAINT saved_places_kind_check CHECK (kind IN ('city', 'trip'));
ALTER TABLE public.saved_places ADD CONSTRAINT saved_places_trip_plan_len CHECK (trip_plan IS NULL OR char_length(trip_plan) <= 30000);
ALTER TABLE public.saved_places ADD CONSTRAINT saved_places_from_len CHECK (from_location IS NULL OR char_length(from_location) <= 150);
ALTER TABLE public.saved_places ADD CONSTRAINT saved_places_budget_len CHECK (budget IS NULL OR char_length(budget) <= 60);
ALTER TABLE public.saved_places ADD CONSTRAINT saved_places_mode_len CHECK (transport_mode IS NULL OR char_length(transport_mode) <= 40);

CREATE TABLE public.city_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  state_name TEXT NOT NULL CHECK (char_length(state_name) BETWEEN 1 AND 100),
  city_name TEXT NOT NULL CHECK (char_length(city_name) BETWEEN 1 AND 150),
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX city_history_user_idx ON public.city_history (user_id, viewed_at DESC);
GRANT SELECT, INSERT, DELETE ON public.city_history TO authenticated;
GRANT ALL ON public.city_history TO service_role;
ALTER TABLE public.city_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own history" ON public.city_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users add own history" ON public.city_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users clear own history" ON public.city_history FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, message_id)
);
CREATE INDEX chat_messages_user_idx ON public.chat_messages (user_id, created_at);
GRANT SELECT, INSERT, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own chat" ON public.chat_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users add own chat" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users clear own chat" ON public.chat_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);