
-- 1. Realtime: profile and activity stream broadcast updates
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.withdrawals REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawals;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- 2. Gift card fields on withdrawals
ALTER TABLE public.withdrawals
  ADD COLUMN IF NOT EXISTS gift_card_brand text,
  ADD COLUMN IF NOT EXISTS recipient_email text,
  ADD COLUMN IF NOT EXISTS admin_notes text;

ALTER TABLE public.withdrawals ALTER COLUMN amount_btc DROP NOT NULL;
ALTER TABLE public.withdrawals ALTER COLUMN amount_btc SET DEFAULT 0;

-- 3. Replace request_withdrawal with gift card flow
DROP FUNCTION IF EXISTS public.request_withdrawal(integer, text);

CREATE OR REPLACE FUNCTION public.request_withdrawal(
  p_points integer,
  p_brand text,
  p_email text
)
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
  IF p_points IS NULL OR p_points < 3000 THEN
    RAISE EXCEPTION 'Minimum redemption is 3000 points';
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

-- 4. Daily trivia helper: deterministic question seed per (user, date).
-- Used by client to rotate the question pool every 24 hours.
CREATE OR REPLACE FUNCTION public.trivia_daily_seed()
RETURNS bigint
LANGUAGE sql
STABLE
AS $function$
  SELECT (extract(epoch from CURRENT_DATE)::bigint);
$function$;
