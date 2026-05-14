
-- Tap Dash scores table
CREATE TABLE public.tap_dash_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  score integer NOT NULL,
  combo_max integer NOT NULL DEFAULT 0,
  hits integer NOT NULL DEFAULT 0,
  duration_ms integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tap_dash_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own scores"
  ON public.tap_dash_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_tap_dash_user_created ON public.tap_dash_scores(user_id, created_at DESC);
CREATE INDEX idx_tap_dash_score_created ON public.tap_dash_scores(score DESC, created_at DESC);

-- Claim Tap Dash reward (validates round, awards points, stores score)
CREATE OR REPLACE FUNCTION public.claim_tapdash_reward(
  p_score integer,
  p_hits integer,
  p_combo_max integer,
  p_duration_ms integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  last_at timestamptz;
  today_count int;
  reward_pts int := 0;
  prof public.profiles;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  -- Validation
  IF p_score IS NULL OR p_hits IS NULL OR p_duration_ms IS NULL THEN
    RAISE EXCEPTION 'Invalid round data';
  END IF;
  IF p_score < 0 OR p_score > 1000 THEN RAISE EXCEPTION 'Invalid score'; END IF;
  IF p_hits < 0 OR p_hits > 1000 THEN RAISE EXCEPTION 'Invalid hits'; END IF;
  IF p_duration_ms < 28000 OR p_duration_ms > 35000 THEN
    RAISE EXCEPTION 'Invalid round duration';
  END IF;
  -- Score must be consistent with hits (combo cap x4)
  IF p_score > p_hits * 4 OR p_hits > p_score THEN
    RAISE EXCEPTION 'Score validation failed';
  END IF;

  -- Cooldown: 60s between rounds
  last_at := public._last_tx_at(uid, 'tap_dash');
  IF last_at IS NOT NULL AND last_at > now() - interval '60 seconds' THEN
    RAISE EXCEPTION 'Please wait before starting another round';
  END IF;

  -- Daily cap: 20 rewarded rounds per 24h
  SELECT count(*) INTO today_count FROM public.transactions
    WHERE user_id = uid AND type = 'tap_dash' AND created_at > now() - interval '24 hours';
  IF today_count >= 20 THEN
    RAISE EXCEPTION 'Daily Tap Dash reward limit reached';
  END IF;

  -- Milestone reward
  IF p_score >= 200 THEN reward_pts := 35;
  ELSIF p_score >= 120 THEN reward_pts := 20;
  ELSIF p_score >= 60 THEN reward_pts := 10;
  ELSIF p_score >= 25 THEN reward_pts := 5;
  END IF;

  -- Always log the score
  INSERT INTO public.tap_dash_scores (user_id, score, combo_max, hits, duration_ms)
    VALUES (uid, p_score, p_combo_max, p_hits, p_duration_ms);

  IF reward_pts > 0 THEN
    prof := public.award_points('tap_dash', reward_pts,
      jsonb_build_object('score', p_score, 'combo', p_combo_max));
  ELSE
    SELECT * INTO prof FROM public.profiles WHERE id = uid;
  END IF;

  RETURN jsonb_build_object(
    'reward_points', reward_pts,
    'score', p_score,
    'points', prof.points,
    'total_earned', prof.total_earned
  );
END $$;

REVOKE ALL ON FUNCTION public.claim_tapdash_reward(integer,integer,integer,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_tapdash_reward(integer,integer,integer,integer) TO authenticated;

-- Weekly leaderboard
CREATE OR REPLACE FUNCTION public.tap_dash_weekly_leaderboard()
RETURNS TABLE(user_id uuid, name text, best_score int, rounds int)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.user_id,
         COALESCE(p.name, 'Player') AS name,
         MAX(s.score)::int AS best_score,
         COUNT(*)::int AS rounds
    FROM public.tap_dash_scores s
    LEFT JOIN public.profiles p ON p.id = s.user_id
   WHERE s.created_at > now() - interval '7 days'
   GROUP BY s.user_id, p.name
   ORDER BY best_score DESC, rounds DESC
   LIMIT 50;
$$;

REVOKE ALL ON FUNCTION public.tap_dash_weekly_leaderboard() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.tap_dash_weekly_leaderboard() TO authenticated;
