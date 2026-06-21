CREATE OR REPLACE FUNCTION public.request_withdrawal(p_points integer, p_brand text, p_email text)
 RETURNS withdrawals
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  fee int;
  total int;
  prof public.profiles;
  wd public.withdrawals;
  allowed_brands text[] := ARRAY['amazon','visa','google_play','apple','steam','starbucks'];
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_points IS NULL OR p_points < 10000 THEN
    RAISE EXCEPTION 'Minimum redemption is 10000 points';
  END IF;
  IF p_brand IS NULL OR NOT (p_brand = ANY(allowed_brands)) THEN
    RAISE EXCEPTION 'Please select a valid gift card brand';
  END IF;
  IF p_email IS NULL
     OR length(trim(p_email)) < 5
     OR length(p_email) > 255
     OR p_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Please enter a valid recipient email address';
  END IF;

  fee := ceil(p_points * 0.02)::int;
  total := p_points + fee;

  SELECT * INTO prof FROM public.profiles WHERE id = uid FOR UPDATE;
  IF prof.points < total THEN
    RAISE EXCEPTION 'Insufficient points (need %; have %)', total, prof.points;
  END IF;

  UPDATE public.profiles SET points = points - total WHERE id = uid;

  INSERT INTO public.withdrawals (
    user_id, points, amount_btc, wallet_address,
    gift_card_brand, recipient_email, status
  ) VALUES (
    uid, total, 0, trim(p_email),
    p_brand, trim(p_email), 'pending'
  ) RETURNING * INTO wd;

  INSERT INTO public.transactions (user_id, type, points, meta)
    VALUES (uid, 'withdrawal', -total,
      jsonb_build_object('withdrawal_id', wd.id, 'fee', fee, 'brand', p_brand));

  RETURN wd;
END $function$;

CREATE OR REPLACE FUNCTION public.claim_spin_reward()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  last_at timestamptz;
  segments int[] := ARRAY[2,5,3,10,2,15,5,8];
  idx int;
  pts int;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  last_at := public._last_tx_at(uid, 'spin_wheel');
  IF last_at IS NOT NULL AND last_at > now() - interval '30 seconds' THEN
    RAISE EXCEPTION 'Please wait before spinning again';
  END IF;
  idx := floor(random() * array_length(segments, 1))::int;
  pts := segments[idx + 1];
  PERFORM public.award_points('spin_wheel', pts, jsonb_build_object('segment', idx));
  RETURN jsonb_build_object('segment', idx, 'points', pts);
END $function$;