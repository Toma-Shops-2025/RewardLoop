## What's happening

I checked your database and found the real bug — and it's a good news / bad news situation.

**Good news:** the wheel is working. Your spins are being recorded in the `transactions` table:
- 3 spin rewards logged for your account today (15, 20, 20 points)

**Bad news:** your account is missing its `profiles` row entirely. The `award_points` function updates the profile to add points, but if no profile row exists, the UPDATE silently affects 0 rows — the transaction still gets logged, but your balance stays at 0.

## Root cause

The database has a `handle_new_user()` function that's supposed to create a profile automatically when someone signs up. But the **trigger that calls it on `auth.users` is missing**. So:
- Users who sign up via Google on the phone → no profile row → points never stick
- Older users (who signed up when the trigger existed) → fine

That's why two profiles in the DB work normally, but your new phone-signup account shows 0.

## The fix (one migration)

1. **Recreate the missing trigger** on `auth.users` so every new signup gets a profile:
   ```sql
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

2. **Backfill profiles** for any existing auth users who don't have one, and credit them the points from transactions they already earned:
   ```sql
   -- Create missing profiles
   INSERT INTO public.profiles (id, name, email, referral_code, points, total_earned)
   SELECT u.id, u.raw_user_meta_data->>'name', u.email,
          public.gen_referral_code(), 0, 0
   FROM auth.users u
   LEFT JOIN public.profiles p ON p.id = u.id
   WHERE p.id IS NULL;

   -- Credit them the points from already-logged transactions
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
     AND p.total_earned = 0;  -- only freshly-backfilled rows
   ```

After this runs, your phone account will get its profile created and the 55 points from your three spins will appear on the dashboard. New signups will work correctly going forward.

No app code changes needed — this is purely a database fix.