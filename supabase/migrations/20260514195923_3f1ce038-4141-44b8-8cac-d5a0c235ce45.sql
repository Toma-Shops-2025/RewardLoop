
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT format('%I.%I(%s)', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)) AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'award_points','claim_spin_reward','claim_tapdash_reward',
        'claim_trivia_reward','claim_video_reward','daily_checkin',
        'request_withdrawal','tap_dash_weekly_leaderboard',
        '_last_tx_at','trivia_daily_seed','gen_referral_code'
      )
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon', fn.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', fn.sig);
  END LOOP;
END $$;
