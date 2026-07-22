-- ============================================================
-- SUPABASE_UPDATE_3.sql
-- Run this once in the Supabase SQL Editor (after SUPABASE_UPDATE_2.sql).
-- Adds "owned_frames" so a purchased profile frame is unlocked
-- permanently — switching back to a frame you already bought no
-- longer costs diamonds again, only the FIRST purchase does.
-- Safe to re-run.
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS owned_frames TEXT[] DEFAULT ARRAY['none'];

-- Grandfather in whatever frame each user already has equipped (from
-- before this column existed) so nobody gets locked out of their
-- current frame.
UPDATE profiles
SET owned_frames = ARRAY(
  SELECT DISTINCT unnest(COALESCE(owned_frames, ARRAY['none']) || ARRAY[COALESCE(avatar_frame, 'none')])
)
WHERE owned_frames IS NULL OR NOT (COALESCE(avatar_frame, 'none') = ANY(owned_frames));
