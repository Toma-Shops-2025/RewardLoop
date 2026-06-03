-- 1. Recreate the missing trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Backfill profiles for auth users missing one
INSERT INTO public.profiles (id, name, email, referral_code, points, total_earned)
SELECT u.id,
       u.raw_user_meta_data->>'name',
       u.email,
       public.gen_referral_code(),
       0,
       0
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 3. Credit those freshly-backfilled profiles with points from existing transactions
UPDATE public.profiles p
SET points = points + sub.total,
    total_earned = total_earned + sub.total
FROM (
  SELECT user_id, SUM(points)::int AS total
  FROM public.transactions
  WHERE points > 0
  GROUP BY user_id
) sub
WHERE p.id = sub.user_id
  AND p.total_earned = 0
  AND sub.total > 0;