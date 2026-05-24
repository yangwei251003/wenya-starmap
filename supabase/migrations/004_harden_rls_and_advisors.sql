-- 收敛 RLS 策略并修复 Supabase advisor 提醒

ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.ensure_user_study_settings(uuid) SET search_path = public;

CREATE OR REPLACE VIEW study_queue_view WITH (security_invoker = true) AS
SELECT
  sl.*,
  CASE
    WHEN sl.next_review <= NOW() AND sl.state != 'new' THEN 1
    WHEN sl.state = 'new' THEN 2
    ELSE 3
  END as priority,
  EXTRACT(EPOCH FROM (NOW() - sl.next_review)) / 3600 as overdue_hours
FROM study_logs sl
ORDER BY priority, overdue_hours DESC, sl.next_review ASC;

CREATE INDEX IF NOT EXISTS idx_dialogue_messages_session_id ON dialogue_messages(session_id);

DO $$
DECLARE t text;
BEGIN
  DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;
  CREATE POLICY "Users can manage own profile" ON user_profiles
    FOR ALL USING ((select auth.uid()) = id)
    WITH CHECK ((select auth.uid()) = id);

  FOREACH t IN ARRAY ARRAY[
    'learning_paths',
    'dialogue_sessions',
    'dialogue_messages',
    'mistake_bank',
    'star_map_progress',
    'purchase_orders',
    'star_coin_transactions',
    'purchased_courses',
    'subscriptions',
    'study_logs',
    'review_logs',
    'user_study_settings',
    'voice_sessions'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Users can read own rows" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Users can manage own rows" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Users can read own voice sessions" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Users can insert own voice sessions" ON %I', t);
    EXECUTE format(
      'CREATE POLICY "Users can manage own rows" ON %I FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id)',
      t
    );
  END LOOP;

  DROP POLICY IF EXISTS "Service role only stripe events" ON stripe_events;
  CREATE POLICY "Service role only stripe events" ON stripe_events
    FOR ALL USING (false) WITH CHECK (false);

  DROP POLICY IF EXISTS "Service role only admin audit logs" ON admin_audit_logs;
  CREATE POLICY "Service role only admin audit logs" ON admin_audit_logs
    FOR ALL USING (false) WITH CHECK (false);
END $$;
