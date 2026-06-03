## Goal

Get testers back into a working app ASAP by rolling the project back to the last good state (before the wheel + logo updates that introduced the white screen). Keep the newer backend (email infra, unsubscribe page, DB) intact — reverting code does not delete database tables or domain config.

## How we'll do it

Use Lovable's built-in **History** (no code edits, no AAB rebuild). Since the app is a PWA loading `rewardloop.fun`, the moment we revert + Publish → Update, every tester's app loads the working version again. Play Store is untouched.

## Steps

1. Open **History** (top of the chat).
2. Find the last message/version from **before** the wheel/logo work started — the version testers were hammering on v18. Look for a checkpoint from around when v2.1.6 / v18 was built.
3. Click **Restore** on that version. The project snaps back to that exact state.
4. Verify the preview loads (no white screen, wheel spins, login works).
5. Click **Publish → Update**. Live site updates in ~30 seconds.
6. Have a tester force-close and reopen the PWA — they'll get the rolled-back version automatically.

## What stays vs what goes

**Stays (backend is separate from code history):**
- Database tables and all user data
- `rewardloop.fun` custom domain
- Email domain setup (`@rewardloop.fun`)
- Play Store listing and existing AAB v25 (we don't touch Play Console)

**Goes (rolled back with the code):**
- Recent wheel changes
- Recent logo changes
- The email infrastructure files added in the last session (unsubscribe page, admin alert template, etc.) — the DB table for suppression stays, just the frontend wiring goes

You can re-add the wheel/logo/email work later, one small change at a time, and test each before publishing.

## After testers confirm it works

When you're ready to redo the wheel + logo, do them as **separate small changes**, publishing and testing each one before moving to the next. That way if a white screen comes back, we know exactly which change caused it.

<presentation-actions>
<presentation-open-history>Open History</presentation-open-history>
</presentation-actions>