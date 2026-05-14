DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='tap_dash_scores' AND policyname='Users insert own scores'
  ) THEN
    CREATE POLICY "Users insert own scores"
    ON public.tap_dash_scores
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM public.tap_dash_scores WHERE user_id = uid;
  DELETE FROM public.transactions    WHERE user_id = uid;
  DELETE FROM public.withdrawals     WHERE user_id = uid;

  UPDATE public.profiles
  SET name = 'Deleted user',
      email = NULL,
      points = 0,
      total_earned = 0,
      referred_by = NULL,
      login_streak = 0,
      last_login_date = NULL
  WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_my_account() FROM public;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;

CREATE TABLE IF NOT EXISTS public.user_consent (
  user_id uuid PRIMARY KEY,
  ads_personalized boolean NOT NULL DEFAULT false,
  analytics boolean NOT NULL DEFAULT false,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  region text
);

ALTER TABLE public.user_consent ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_consent' AND policyname='Users view own consent') THEN
    CREATE POLICY "Users view own consent" ON public.user_consent FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_consent' AND policyname='Users insert own consent') THEN
    CREATE POLICY "Users insert own consent" ON public.user_consent FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_consent' AND policyname='Users update own consent') THEN
    CREATE POLICY "Users update own consent" ON public.user_consent FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;