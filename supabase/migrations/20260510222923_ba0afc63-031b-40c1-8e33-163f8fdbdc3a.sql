
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by UUID REFERENCES public.profiles(id),
  login_streak INTEGER NOT NULL DEFAULT 0,
  last_login_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  points INTEGER NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_transactions_user ON public.transactions(user_id, created_at DESC);

-- Withdrawals
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  amount_btc NUMERIC(18,8) NOT NULL,
  wallet_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own withdrawals" ON public.withdrawals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Generate a referral code helper
CREATE OR REPLACE FUNCTION public.gen_referral_code()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE code TEXT;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = code);
  END LOOP;
  RETURN code;
END $$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ref_code TEXT;
  ref_input TEXT;
  ref_user UUID;
BEGIN
  ref_code := public.gen_referral_code();
  ref_input := NEW.raw_user_meta_data->>'referral_code';
  IF ref_input IS NOT NULL AND ref_input <> '' THEN
    SELECT id INTO ref_user FROM public.profiles WHERE referral_code = upper(ref_input);
  END IF;

  INSERT INTO public.profiles (id, name, email, referral_code, referred_by, points, total_earned)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    ref_code,
    ref_user,
    CASE WHEN ref_user IS NOT NULL THEN 50 ELSE 0 END,
    CASE WHEN ref_user IS NOT NULL THEN 50 ELSE 0 END
  );

  -- Bonus transaction for new user using a referral
  IF ref_user IS NOT NULL THEN
    INSERT INTO public.transactions (user_id, type, points, meta)
    VALUES (NEW.id, 'referral_bonus', 50, jsonb_build_object('referred_by', ref_user));
  END IF;

  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Atomic award points RPC
CREATE OR REPLACE FUNCTION public.award_points(
  p_type TEXT,
  p_points INTEGER,
  p_meta JSONB DEFAULT '{}'::jsonb
)
RETURNS public.profiles
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID := auth.uid();
  prof public.profiles;
  ref UUID;
  commission INTEGER;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_points <= 0 OR p_points > 10000 THEN RAISE EXCEPTION 'Invalid points'; END IF;

  UPDATE public.profiles
    SET points = points + p_points,
        total_earned = total_earned + p_points
    WHERE id = uid
    RETURNING * INTO prof;

  INSERT INTO public.transactions (user_id, type, points, meta)
  VALUES (uid, p_type, p_points, p_meta);

  -- 10% lifetime commission to referrer
  SELECT referred_by INTO ref FROM public.profiles WHERE id = uid;
  IF ref IS NOT NULL THEN
    commission := GREATEST(1, (p_points / 10));
    UPDATE public.profiles SET points = points + commission, total_earned = total_earned + commission WHERE id = ref;
    INSERT INTO public.transactions (user_id, type, points, meta)
    VALUES (ref, 'referral_commission', commission, jsonb_build_object('from', uid));
  END IF;

  RETURN prof;
END $$;

-- Daily check-in RPC
CREATE OR REPLACE FUNCTION public.daily_checkin()
RETURNS public.profiles
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID := auth.uid();
  prof public.profiles;
  bonus INTEGER;
  new_streak INTEGER;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO prof FROM public.profiles WHERE id = uid;
  IF prof.last_login_date = CURRENT_DATE THEN
    RAISE EXCEPTION 'Already claimed today';
  END IF;
  IF prof.last_login_date = CURRENT_DATE - 1 THEN
    new_streak := prof.login_streak + 1;
  ELSE
    new_streak := 1;
  END IF;
  bonus := 10 + LEAST(new_streak, 7) * 5;
  UPDATE public.profiles
    SET login_streak = new_streak,
        last_login_date = CURRENT_DATE,
        points = points + bonus,
        total_earned = total_earned + bonus
    WHERE id = uid RETURNING * INTO prof;
  INSERT INTO public.transactions (user_id, type, points, meta)
  VALUES (uid, 'daily_checkin', bonus, jsonb_build_object('streak', new_streak));
  RETURN prof;
END $$;
