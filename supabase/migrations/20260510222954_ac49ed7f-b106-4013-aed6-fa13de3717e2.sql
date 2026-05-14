
ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.gen_referral_code() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.gen_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_points(TEXT, INTEGER, JSONB) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.daily_checkin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_points(TEXT, INTEGER, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.daily_checkin() TO authenticated;
