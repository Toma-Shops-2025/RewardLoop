REVOKE EXECUTE ON FUNCTION public.claim_video_reward()  FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_spin_reward()   FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_trivia_reward() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.request_withdrawal(integer, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.award_points(text, integer, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.daily_checkin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public._last_tx_at(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.gen_referral_code() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.daily_checkin() TO authenticated;