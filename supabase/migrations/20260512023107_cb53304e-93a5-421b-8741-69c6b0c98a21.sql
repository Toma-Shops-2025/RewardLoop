DROP POLICY IF EXISTS "Users insert own transactions" ON public.transactions;

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile name"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (name) ON public.profiles TO authenticated;

REVOKE EXECUTE ON FUNCTION public.award_points(text, integer, jsonb) FROM PUBLIC;
DO $$ BEGIN
  EXECUTE 'REVOKE EXECUTE ON FUNCTION public.award_points(text, integer, jsonb) FROM anon';
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN
  EXECUTE 'REVOKE EXECUTE ON FUNCTION public.award_points(text, integer, jsonb) FROM authenticated';
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public._last_tx_at(p_user uuid, p_type text)
RETURNS timestamptz
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT MAX(created_at) FROM public.transactions
   WHERE user_id = p_user AND type = p_type;
$$;
REVOKE EXECUTE ON FUNCTION public._last_tx_at(uuid, text) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.claim_video_reward()
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  last_at timestamptz;
  pts integer;
  prof public.profiles;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  last_at := public._last_tx_at(uid, 'watch_video');
  IF last_at IS NOT NULL AND last_at > now() - interval '8 seconds' THEN
    RAISE EXCEPTION 'Please wait before claiming another reward';
  END IF;
  pts := 5 + floor(random() * 6)::int;
  prof := public.award_points('watch_video', pts, '{}'::jsonb);
  RETURN prof;
END $$;

CREATE OR REPLACE FUNCTION public.claim_spin_reward()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  last_at timestamptz;
  segments int[] := ARRAY[5,10,25,50,15,100,20,75];
  idx int;
  pts int;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  last_at := public._last_tx_at(uid, 'spin_wheel');
  IF last_at IS NOT NULL AND last_at > now() - interval '5 seconds' THEN
    RAISE EXCEPTION 'Please wait before spinning again';
  END IF;
  idx := floor(random() * array_length(segments, 1))::int;
  pts := segments[idx + 1];
  PERFORM public.award_points('spin_wheel', pts, jsonb_build_object('segment', idx));
  RETURN jsonb_build_object('segment', idx, 'points', pts);
END $$;

CREATE OR REPLACE FUNCTION public.claim_trivia_reward()
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  last_at timestamptz;
  today_count int;
  prof public.profiles;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  last_at := public._last_tx_at(uid, 'trivia');
  IF last_at IS NOT NULL AND last_at > now() - interval '10 seconds' THEN
    RAISE EXCEPTION 'Please wait before answering another question';
  END IF;
  SELECT count(*) INTO today_count FROM public.transactions
    WHERE user_id = uid AND type = 'trivia' AND created_at > now() - interval '24 hours';
  IF today_count >= 30 THEN
    RAISE EXCEPTION 'Daily trivia reward limit reached';
  END IF;
  prof := public.award_points('trivia', 15, '{}'::jsonb);
  RETURN prof;
END $$;

GRANT EXECUTE ON FUNCTION public.claim_video_reward()  TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_spin_reward()   TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_trivia_reward() TO authenticated;

CREATE OR REPLACE FUNCTION public.request_withdrawal(p_points integer, p_destination text)
RETURNS public.withdrawals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  fee int;
  total int;
  sats numeric;
  btc numeric;
  prof public.profiles;
  wd public.withdrawals;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_points IS NULL OR p_points < 3000 THEN
    RAISE EXCEPTION 'Minimum redemption is 3000 points';
  END IF;
  IF p_destination IS NULL OR length(trim(p_destination)) < 6 OR length(p_destination) > 500 THEN
    RAISE EXCEPTION 'Invalid payout destination';
  END IF;

  fee := ceil(p_points * 0.02)::int;
  total := p_points + fee;
  sats := p_points;
  btc := sats / 100000000.0;

  SELECT * INTO prof FROM public.profiles WHERE id = uid FOR UPDATE;
  IF prof.points < total THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;

  UPDATE public.profiles SET points = points - total WHERE id = uid;

  INSERT INTO public.withdrawals (user_id, points, amount_btc, wallet_address, status)
    VALUES (uid, total, btc, p_destination, 'pending')
    RETURNING * INTO wd;

  INSERT INTO public.transactions (user_id, type, points, meta)
    VALUES (uid, 'withdrawal', -total, jsonb_build_object('withdrawal_id', wd.id, 'fee', fee));

  RETURN wd;
END $$;

GRANT EXECUTE ON FUNCTION public.request_withdrawal(integer, text) TO authenticated;